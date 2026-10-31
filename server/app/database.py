import sqlite3
from pathlib import Path


DEFAULT_DATABASE_PATH = Path(__file__).resolve().parents[1] / "data" / "contacts.sqlite3"


def connect(database_path: Path) -> sqlite3.Connection:
    connection = sqlite3.connect(database_path, check_same_thread=False)
    connection.row_factory = sqlite3.Row
    return connection


def initialize_database(database_path: Path) -> None:
    database_path.parent.mkdir(parents=True, exist_ok=True)
    connection = connect(database_path)
    try:
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS contacts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                first_name TEXT NOT NULL,
                last_name TEXT NOT NULL,
                phone TEXT NOT NULL,
                email TEXT,
                image TEXT
            )
            """
        )
        connection.commit()
    finally:
        connection.close()
