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