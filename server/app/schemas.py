import re
from urllib.parse import urlsplit

from pydantic import BaseModel, ConfigDict, Field, field_validator


def to_camel(field_name: str) -> str:
    first, *rest = field_name.split("_")
    return first + "".join(part.capitalize() for part in rest)


class ContactFields(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    first_name: str = Field(min_length=1, max_length=80)
    last_name: str = Field(min_length=1, max_length=80)
    phone: str = Field(min_length=7, max_length=32, pattern=r"^[0-9+().\-\s]+$")
    email: str | None = Field(default=None, max_length=254)
    image: str | None = Field(default=None, max_length=2048)

    @field_validator("first_name", "last_name", "phone", mode="before")
    @classmethod
    def trim_required_strings(cls, value):
        return value.strip() if isinstance(value, str) else value

    @field_validator("email", "image", mode="before")
    @classmethod
    def trim_optional_strings(cls, value):
        if isinstance(value, str):
            return value.strip() or None
        return value

    @field_validator("email")
    @classmethod
    def validate_email(cls, value: str | None) -> str | None:
        if value is not None and not re.fullmatch(r"[^@\s]+@[^@\s]+\.[^@\s]+", value):
            raise ValueError("Enter a valid email address")
        return value

    @field_validator("image")
    @classmethod
    def validate_image_url(cls, value: str | None) -> str | None:
        if value is not None:
            try:
                parsed = urlsplit(value)
            except ValueError as error:
                raise ValueError("Image must be an HTTP or HTTPS URL") from error
            if parsed.scheme not in {"http", "https"} or not parsed.netloc:
                raise ValueError("Image must be an HTTP or HTTPS URL")
        return value


class ContactCreate(ContactFields):
    pass


class ContactUpdate(ContactFields):
    pass


class ContactResponse(ContactFields):
    id: int
