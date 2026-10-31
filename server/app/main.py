from contextlib import asynccontextmanager
from pathlib import Path
import sqlite3

from fastapi import Depends, FastAPI, HTTPException, Request, Response, status

from .database import DEFAULT_DATABASE_PATH, connect, initialize_database
from .schemas import ContactCreate, ContactResponse, ContactUpdate


def create_app(database_path: Path = DEFAULT_DATABASE_PATH) -> FastAPI:
    @asynccontextmanager
    async def lifespan(_: FastAPI):
        initialize_database(database_path)
        yield

    api = FastAPI(
        title="Phone Book Demo API",
        description="A local-only contact API backed by SQLite and synthetic demo data.",
        version="1.0.0",
        lifespan=lifespan,
    )
    api.state.database_path = database_path

    def get_connection(request: Request):
        connection = connect(request.app.state.database_path)
        try:
            yield connection
        finally:
            connection.close()

    @api.get("/contacts", response_model=list[ContactResponse])
    def list_contacts(connection: sqlite3.Connection = Depends(get_connection)):
        rows = connection.execute(
            "SELECT id, first_name, last_name, phone, email, image "
            "FROM contacts ORDER BY last_name COLLATE NOCASE, first_name COLLATE NOCASE, id"
        ).fetchall()
        return [dict(row) for row in rows]

    @api.post(
        "/contacts",
        response_model=ContactResponse,
        status_code=status.HTTP_201_CREATED,
    )
    def create_contact(
        contact: ContactCreate,
        connection: sqlite3.Connection = Depends(get_connection),
    ):
        cursor = connection.execute(
            "INSERT INTO contacts (first_name, last_name, phone, email, image) "
            "VALUES (?, ?, ?, ?, ?)",
            (contact.first_name, contact.last_name, contact.phone, contact.email, contact.image),
        )
        connection.commit()
        row = connection.execute(
            "SELECT id, first_name, last_name, phone, email, image FROM contacts WHERE id = ?",
            (cursor.lastrowid,),
        ).fetchone()
        return dict(row)

    @api.get("/contacts/{contact_id}", response_model=ContactResponse)
    def get_contact(contact_id: int, connection: sqlite3.Connection = Depends(get_connection)):
        row = connection.execute(
            "SELECT id, first_name, last_name, phone, email, image FROM contacts WHERE id = ?",
            (contact_id,),
        ).fetchone()
        if row is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Contact not found")
        return dict(row)

    @api.put("/contacts/{contact_id}", response_model=ContactResponse)
    def update_contact(
        contact_id: int,
        contact: ContactUpdate,
        connection: sqlite3.Connection = Depends(get_connection),
    ):
        cursor = connection.execute(
            "UPDATE contacts SET first_name = ?, last_name = ?, phone = ?, email = ?, image = ? "
            "WHERE id = ?",
            (
                contact.first_name,
                contact.last_name,
                contact.phone,
                contact.email,
                contact.image,
                contact_id,
            ),
        )
        if cursor.rowcount == 0:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Contact not found")
        connection.commit()
        row = connection.execute(
            "SELECT id, first_name, last_name, phone, email, image FROM contacts WHERE id = ?",
            (contact_id,),
        ).fetchone()
        return dict(row)

    @api.delete("/contacts/{contact_id}", status_code=status.HTTP_204_NO_CONTENT)
    def delete_contact(
        contact_id: int,
        connection: sqlite3.Connection = Depends(get_connection),
    ) -> Response:
        cursor = connection.execute("DELETE FROM contacts WHERE id = ?", (contact_id,))
        if cursor.rowcount == 0:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Contact not found")
        connection.commit()
        return Response(status_code=status.HTTP_204_NO_CONTENT)

    return api


app = create_app()
