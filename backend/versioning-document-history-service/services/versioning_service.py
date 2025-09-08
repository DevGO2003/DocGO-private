from typing import Dict, List, Optional
from datetime import datetime

from schemas.versioning import (
    Snapshot, HistoryEvent, DiffResult, ChangeItem, PageResult, RestoreResult
)


class VersioningService:
    def __init__(self) -> None:
        self.snapshots: Dict[str, Snapshot] = {}
        self.history: Dict[str, List[HistoryEvent]] = {}

    def list_snapshots(self, contract_id: Optional[str], created_by: Optional[str], page: int, size: int) -> PageResult:
        data = list(self.snapshots.values())
        if contract_id:
            data = [s for s in data if s.contractId == contract_id]
        if created_by:
            data = [s for s in data if s.createdBy == created_by]
        total = len(data)
        start = page * size
        end = start + size
        page_data = data[start:end]
        return PageResult(
            content=page_data,
            total_elements=total,
            total_pages=(total + size - 1) // size,
            page_number=page,
            page_size=size,
            number_of_elements=len(page_data),
        )

    def get_history(self, contract_id: str, from_time: Optional[str], to_time: Optional[str], actor: Optional[str], event_type: Optional[str]) -> List[HistoryEvent]:
        events = self.history.get(contract_id, [])
        if actor:
            events = [e for e in events if e.actor == actor]
        if event_type:
            events = [e for e in events if e.eventType == event_type]
        return events

    def compute_diff(self, contract_id: str, left: int, right: int, mode: str) -> DiffResult:
        # Placeholder: return a simple diff result
        changes = [
            ChangeItem(path="/section/1", changeType="MODIFIED", before="text A", after="text B"),
        ]
        return DiffResult(leftVersion=left, rightVersion=right, summary=f"{len(changes)} changes", changes=changes)

    def restore_version(self, contract_id: str, version: int, reason: Optional[str], actor_id: Optional[str]) -> Optional[RestoreResult]:
        # Placeholder: pretend to restore and create a new version
        restored_from = version
        new_version = version + 1
        return RestoreResult(contractId=contract_id, restoredFromVersion=restored_from, newVersion=new_version, status="RESTORED", note=reason)

from __future__ import annotations

from typing import List, Optional
from dataclasses import dataclass
from sqlalchemy import create_engine, String, Integer, Text, DateTime
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, sessionmaker
from sqlalchemy.sql import func
import os


DATABASE_URL = os.getenv("DATABASE_URL", "mysql+pymysql://docgo_user:docgo_password@localhost:3307/docgo")


class Base(DeclarativeBase):
    pass


class SnapshotORM(Base):
    __tablename__ = "snapshots"

    snapshot_id: Mapped[str] = mapped_column("snapshot_id", String(64), primary_key=True)
    contract_id: Mapped[str] = mapped_column("contract_id", String(64), index=True)
    version: Mapped[int] = mapped_column("version", Integer, index=True)
    created_at: Mapped[DateTime] = mapped_column("created_at", DateTime(timezone=True), server_default=func.now())
    created_by: Mapped[str] = mapped_column("created_by", String(128))
    checksum: Mapped[Optional[str]] = mapped_column("checksum", String(128), nullable=True)
    size: Mapped[Optional[int]] = mapped_column("size", Integer, nullable=True)
    note: Mapped[Optional[str]] = mapped_column("note", Text, nullable=True)


class HistoryEventORM(Base):
    __tablename__ = "history_events"

    event_id: Mapped[str] = mapped_column("event_id", String(64), primary_key=True)
    contract_id: Mapped[str] = mapped_column("contract_id", String(64), index=True)
    version: Mapped[int] = mapped_column("version", Integer, index=True)
    event_type: Mapped[str] = mapped_column("event_type", String(64))
    actor: Mapped[str] = mapped_column("actor", String(128))
    timestamp: Mapped[DateTime] = mapped_column("timestamp", DateTime(timezone=True), server_default=func.now())
    metadata_json: Mapped[Optional[str]] = mapped_column("metadata_json", Text, nullable=True)


engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


def init_db() -> None:
    Base.metadata.create_all(engine)


@dataclass
class PaginatedResult:
    page_number: int
    page_size: int
    total_elements: int
    total_pages: int
    items: List[SnapshotORM]


class VersioningService:
    def list_snapshots(self, page_number: int, page_size: int, search_term: Optional[str], contract_id: Optional[str]) -> PaginatedResult:
        with SessionLocal() as session:
            query = session.query(SnapshotORM)
            if contract_id:
                query = query.filter(SnapshotORM.contract_id == contract_id)
            if search_term:
                like = f"%{search_term}%"
                query = query.filter((SnapshotORM.note.ilike(like)) | (SnapshotORM.created_by.ilike(like)))

            total = query.count()
            items = (
                query.order_by(SnapshotORM.created_at.desc())
                .offset(page_number * page_size)
                .limit(page_size)
                .all()
            )
            total_pages = (total + page_size - 1) // page_size if page_size > 0 else 0
            return PaginatedResult(page_number, page_size, total, total_pages, items)

    def get_history(self, contract_id: str) -> List[HistoryEventORM]:
        with SessionLocal() as session:
            return (
                session.query(HistoryEventORM)
                .filter(HistoryEventORM.contract_id == contract_id)
                .order_by(HistoryEventORM.timestamp.desc())
                .all()
            )

    def compute_diff(self, contract_id: str, left: int, right: int, mode: str) -> dict:
        # Placeholder for actual diff logic
        return {
            "leftVersion": left,
            "rightVersion": right,
            "summary": "Không có thay đổi hoặc chưa triển khai diff thực.",
            "changes": [],
        }

    def restore_version(self, contract_id: str, version: int, reason: str, actor: str) -> dict:
        # Placeholder for actual restore logic and event publish
        return {
            "contractId": contract_id,
            "restoredFromVersion": version,
            "newVersion": version + 1,
            "status": "restored",
            "note": reason,
        }


