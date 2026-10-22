import cloudinary
import cloudinary.uploader

from core.config import settings


# ==================================================
# CLOUDINARY CONFIGURATION
# ==================================================

cloudinary.config(
    cloud_name=settings.cloudinary_cloud_name,
    api_key=settings.cloudinary_api_key,
    api_secret=settings.cloudinary_api_secret,
    secure=True,
)


# ==================================================
# UPLOAD IMAGE
# ==================================================

def upload_image(
    image_bytes: bytes,
    filename: str | None = None,
) -> str:

    result = cloudinary.uploader.upload(
        image_bytes,
        resource_type="image",
        folder="queryai/images",
        overwrite=False,
    )

    return result["secure_url"]


# ==================================================
# UPLOAD DOCUMENT
# ==================================================

def upload_document(
    document_bytes: bytes,
    filename: str | None = None,
) -> str:

    if not filename:
        filename = "document"

    # --------------------------------------------------
    # Determine extension
    # --------------------------------------------------

    extension = ""

    if "." in filename:
        extension = "." + filename.rsplit(".", 1)[1].lower()


    # --------------------------------------------------
    # Create temporary file
    # --------------------------------------------------

    import os
    import tempfile

    temp_file = tempfile.NamedTemporaryFile(
        delete=False,
        suffix=extension
    )

    try:

        temp_file.write(
            document_bytes
        )

        temp_file.close()


        # --------------------------------------------------
        # Upload actual file to Cloudinary
        # --------------------------------------------------

        result = cloudinary.uploader.upload(
            temp_file.name,
            resource_type="raw",
            folder="queryai/documents",
            use_filename=True,
            unique_filename=True,
            overwrite=False,
        )


        return result["secure_url"]


    finally:

        if os.path.exists(
            temp_file.name
        ):

            os.remove(
                temp_file.name
            )