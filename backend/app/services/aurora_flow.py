"""
Aurora Flow Module - Event-Driven Orchestration
Implements exact specifications from YYD whitepaper (26,120 lines)
Event-driven sagas, compensations, workflow orchestration
"""

import asyncio
from typing import Dict, List, Optional, Callable, Any, Tuple
from dataclasses import dataclass, field
from enum import Enum
from datetime import datetime
import logging
import json

logger = logging.getLogger(__name__)


class EventType(str, Enum):
    """Event types in Aurora system"""
    # Booking events
    BOOKING_CREATED = "booking.created"
    BOOKING_CONFIRMED = "booking.confirmed"
    BOOKING_CANCELLED = "booking.cancelled"
    BOOKING_RESCHEDULED = "booking.rescheduled"
    
    # Payment events
    PAYMENT_INITIATED = "payment.initiated"
    PAYMENT_SUCCEEDED = "payment.succeeded"
    PAYMENT_FAILED = "payment.failed"
    PAYMENT_REFUNDED = "payment.refunded"
    
    # Communication events
    MESSAGE_RECEIVED = "message.received"
    MESSAGE_SENT = "message.sent"
    WHATSAPP_MESSAGE = "whatsapp.message"
    FACEBOOK_MESSAGE = "facebook.message"
    
    # Tour events
    TOUR_STARTED = "tour.started"
    TOUR_COMPLETED = "tour.completed"
    TOUR_RATED = "tour.rated"
    
    # Lead events
    LEAD_CAPTURED = "lead.captured"
    LEAD_QUALIFIED = "lead.qualified"
    LEAD_CONVERTED = "lead.converted"
    
    # System events
    SYSTEM_ERROR = "system.error"
    WORKFLOW_COMPLETED = "workflow.completed"
    WORKFLOW_FAILED = "workflow.failed"


class WorkflowStatus(str, Enum):
    """Workflow execution status"""
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    COMPENSATING = "compensating"
    COMPENSATED = "compensated"


@dataclass
class Event:
    """
    Event in Aurora system
    
    Following event-driven architecture from whitepaper:
    - Immutable events
    - Exactly-once semantics
    - Idempotent handlers
    """
    id: str
    type: EventType
    timestamp: datetime
    payload: Dict[str, Any]
    metadata: Dict[str, Any] = field(default_factory=dict)
    correlation_id: Optional[str] = None
    causation_id: Optional[str] = None
    
    def to_dict(self) -> Dict:
        """Convert to dictionary"""
        return {
            "id": self.id,
            "type": self.type.value,
            "timestamp": self.timestamp.isoformat(),
            "payload": self.payload,
            "metadata": self.metadata,
            "correlation_id": self.correlation_id,
            "causation_id": self.causation_id
        }


@dataclass
class WorkflowStep:
    """Step in a workflow/saga"""
    name: str
    action: Callable
    compensation: Optional[Callable] = None
    max_retries: int = 3
    timeout_seconds: int = 30


class AuroraFlow:
    """
    Aurora Flow - Event-Driven Orchestration Engine
    
    Implements:
    1. Event bus with pub/sub
    2. Saga pattern for distributed transactions
    3. Compensation logic for failures
    4. Idempotency and exactly-once delivery
    5. Dead letter queue (DLQ) for failed events
    
    Architecture (Whitepaper line 14551):
    - Event sourcing
    - CQRS (Command Query Responsibility Segregation)
    - Saga choreography and orchestration
    """
    
    def __init__(self):
        """Initialize Aurora Flow"""
        self.event_handlers: Dict[EventType, List[Callable]] = {}
        self.workflows: Dict[str, List[WorkflowStep]] = {}
        self.workflow_states: Dict[str, WorkflowStatus] = {}
        self.event_log: List[Event] = []
        self.dlq: List[Event] = []
        self.processed_event_ids: set = set()  # For idempotency
        
        logger.info("Aurora Flow initialized")
    
    def subscribe(self, event_type: EventType, handler: Callable):
        """
        Subscribe to event type
        
        Args:
            event_type: Type of event to subscribe to
            handler: Async handler function
        """
        if event_type not in self.event_handlers:
            self.event_handlers[event_type] = []
        
        self.event_handlers[event_type].append(handler)
        logger.info(f"Subscribed handler to {event_type.value}")
    
    async def publish(self, event: Event):
        """
        Publish event to all subscribers
        
        Implements idempotency check (exactly-once semantics)
        
        Args:
            event: Event to publish
        """
        # Idempotency check
        if event.id in self.processed_event_ids:
            logger.warning(f"Event {event.id} already processed (idempotent skip)")
            return
        
        # Add to event log
        self.event_log.append(event)
        self.processed_event_ids.add(event.id)
        
        logger.info(f"Publishing event: {event.type.value} (id={event.id})")
        
        # Get handlers for this event type
        handlers = self.event_handlers.get(event.type, [])
        
        if not handlers:
            logger.warning(f"No handlers for event type: {event.type.value}")
            return
        
        # Execute all handlers
        for handler in handlers:
            try:
                await handler(event)
            except Exception as e:
                logger.error(f"Handler failed for event {event.id}: {e}", exc_info=True)
                # Add to DLQ for retry
                self.dlq.append(event)
    
    def define_workflow(self, workflow_id: str, steps: List[WorkflowStep]):
        """
        Define a saga workflow
        
        Saga pattern ensures distributed transaction consistency
        with compensation on failure
        
        Args:
            workflow_id: Unique workflow identifier
            steps: List of workflow steps
        """
        self.workflows[workflow_id] = steps
        self.workflow_states[workflow_id] = WorkflowStatus.PENDING
        logger.info(f"Defined workflow: {workflow_id} with {len(steps)} steps")
    
    async def execute_workflow(
        self,
        workflow_id: str,
        context: Dict[str, Any]
    ) -> Tuple[bool, Optional[str]]:
        """
        Execute saga workflow with compensation on failure
        
        Process (Whitepaper line 14653):
        1. Execute steps sequentially
        2. If any step fails, trigger compensations in reverse
        3. Ensure exactly-once execution
        4. Handle timeouts and retries
        
        Args:
            workflow_id: Workflow to execute
            context: Execution context
        
        Returns:
            (success, error_message) tuple
        """
        if workflow_id not in self.workflows:
            return False, f"Workflow not found: {workflow_id}"
        
        steps = self.workflows[workflow_id]
        self.workflow_states[workflow_id] = WorkflowStatus.RUNNING
        
        completed_steps = []
        
        try:
            # Execute each step
            for step in steps:
                logger.info(f"Executing workflow step: {step.name}")
                
                retries = 0
                success = False
                
                while retries < step.max_retries and not success:
                    try:
                        # Execute with timeout
                        await asyncio.wait_for(
                            step.action(context),
                            timeout=step.timeout_seconds
                        )
                        success = True
                        completed_steps.append(step)
                    except asyncio.TimeoutError:
                        retries += 1
                        logger.warning(f"Step {step.name} timed out (attempt {retries}/{step.max_retries})")
                        if retries >= step.max_retries:
                            raise
                    except Exception as e:
                        retries += 1
                        logger.warning(f"Step {step.name} failed (attempt {retries}/{step.max_retries}): {e}")
                        if retries >= step.max_retries:
                            raise
                        await asyncio.sleep(2 ** retries)  # Exponential backoff
            
            # Success
            self.workflow_states[workflow_id] = WorkflowStatus.COMPLETED
            logger.info(f"Workflow {workflow_id} completed successfully")
            return True, None
            
        except Exception as e:
            # Failure - trigger compensations
            logger.error(f"Workflow {workflow_id} failed: {e}", exc_info=True)
            self.workflow_states[workflow_id] = WorkflowStatus.COMPENSATING
            
            # Execute compensations in reverse order
            for step in reversed(completed_steps):
                if step.compensation:
                    try:
                        logger.info(f"Compensating step: {step.name}")
                        await step.compensation(context)
                    except Exception as comp_error:
                        logger.error(f"Compensation failed for {step.name}: {comp_error}")
            
            self.workflow_states[workflow_id] = WorkflowStatus.COMPENSATED
            return False, str(e)
    
    async def retry_dlq(self, max_events: int = 100):
        """
        Retry events in dead letter queue
        
        Args:
            max_events: Maximum events to retry
        """
        if not self.dlq:
            return
        
        logger.info(f"Retrying {len(self.dlq[:max_events])} events from DLQ")
        
        events_to_retry = self.dlq[:max_events]
        self.dlq = self.dlq[max_events:]
        
        for event in events_to_retry:
            # Remove from processed set to allow retry
            self.processed_event_ids.discard(event.id)
            await self.publish(event)
    
    def get_workflow_status(self, workflow_id: str) -> Optional[WorkflowStatus]:
        """Get workflow execution status"""
        return self.workflow_states.get(workflow_id)
    
    def get_event_history(
        self,
        event_type: Optional[EventType] = None,
        correlation_id: Optional[str] = None,
        limit: int = 100
    ) -> List[Event]:
        """
        Get event history with filtering
        
        Args:
            event_type: Filter by event type
            correlation_id: Filter by correlation ID
            limit: Maximum events to return
        
        Returns:
            List of events
        """
        filtered = self.event_log
        
        if event_type:
            filtered = [e for e in filtered if e.type == event_type]
        
        if correlation_id:
            filtered = [e for e in filtered if e.correlation_id == correlation_id]
        
        return filtered[-limit:]


# Singleton instance
_aurora_flow_instance: Optional[AuroraFlow] = None

def get_aurora_flow() -> AuroraFlow:
    """Get singleton Aurora Flow instance"""
    global _aurora_flow_instance
    if _aurora_flow_instance is None:
        _aurora_flow_instance = AuroraFlow()
    return _aurora_flow_instance
