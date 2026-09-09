from PIL import Image
from pathlib import Path
import io
import os


# ============================================================
# ASK USER FOR SETTINGS
# ============================================================

print("=" * 60)
print("        IMAGE COMPRESSION TOOL")
print("=" * 60)
print()

input_folder = Path(
    input("Enter the input folder path: ").strip().strip('"')
)

output_folder = Path(
    input("Enter the output folder path: ").strip().strip('"')
)

while True:
    try:
        max_size_mb = float(
            input("Enter maximum file size in MB: ").strip()
        )

        if max_size_mb <= 0:
            print("Please enter a value greater than 0.")
            continue

        break

    except ValueError:
        print("Please enter a valid number.")


# ============================================================
# SETTINGS
# ============================================================

MIN_QUALITY = 60
MAX_QUALITY = 95

# If an image is still too large at MIN_QUALITY,
# its resolution will be reduced progressively.
RESIZE_STEP = 0.90


# ============================================================
# COMPRESS IMAGE
# ============================================================

def compress_image(input_path, output_path, max_size_mb):

    print(f"\nProcessing: {input_path.name}")

    image = Image.open(input_path)

    # --------------------------------------------------------
    # Handle transparency / unsupported JPEG modes
    # --------------------------------------------------------

    if image.mode in ("RGBA", "LA", "P"):

        if image.mode == "P":
            image = image.convert("RGBA")

        background = Image.new(
            "RGB",
            image.size,
            "white"
        )

        if image.mode in ("RGBA", "LA"):
            background.paste(
                image,
                mask=image.getchannel("A")
            )
        else:
            background.paste(image)

        image = background

    elif image.mode != "RGB":
        image = image.convert("RGB")

    # --------------------------------------------------------
    # Target size in bytes
    # --------------------------------------------------------

    max_bytes = int(
        max_size_mb * 1024 * 1024
    )

    current_image = image

    # --------------------------------------------------------
    # Keep reducing resolution until it fits
    # --------------------------------------------------------

    while True:

        # ====================================================
        # Find highest possible JPEG quality
        # ====================================================

        low = MIN_QUALITY
        high = MAX_QUALITY

        best_data = None
        best_quality = None

        while low <= high:

            quality = (low + high) // 2

            buffer = io.BytesIO()

            current_image.save(
                buffer,
                format="JPEG",
                quality=quality,
                optimize=True,
                progressive=True
            )

            data = buffer.getvalue()

            if len(data) <= max_bytes:

                # This quality works.
                # Try a higher quality.
                best_data = data
                best_quality = quality

                low = quality + 1

            else:

                # Too large.
                # Try lower quality.
                high = quality - 1

        # ====================================================
        # Image fits
        # ====================================================

        if best_data is not None:

            with open(output_path, "wb") as f:
                f.write(best_data)

            final_size = os.path.getsize(output_path)

            print(
                f"  ✓ Done"
            )

            print(
                f"  Size:       "
                f"{final_size / 1024 / 1024:.2f} MB"
            )

            print(
                f"  Quality:    {best_quality}"
            )

            print(
                f"  Resolution: "
                f"{current_image.width}x"
                f"{current_image.height}"
            )

            return

        # ====================================================
        # Even minimum quality is too large.
        # Reduce resolution.
        # ====================================================

        new_width = int(
            current_image.width * RESIZE_STEP
        )

        new_height = int(
            current_image.height * RESIZE_STEP
        )

        if new_width < 100 or new_height < 100:

            raise RuntimeError(
                "Unable to compress image below "
                f"{max_size_mb} MB."
            )

        print(
            f"  Image still too large. "
            f"Reducing resolution to "
            f"{new_width}x{new_height}..."
        )

        current_image = current_image.resize(
            (new_width, new_height),
            Image.Resampling.LANCZOS
        )


# ============================================================
# MAIN
# ============================================================

def main():

    print()
    print("=" * 60)
    print("Checking folders...")
    print("=" * 60)

    # --------------------------------------------------------
    # Validate input folder
    # --------------------------------------------------------

    if not input_folder.exists():

        print(
            f"\nERROR: Input folder does not exist:"
            f"\n{input_folder}"
        )

        return

    if not input_folder.is_dir():

        print(
            "\nERROR: Input path is not a folder."
        )

        return

    # --------------------------------------------------------
    # Create output folder
    # --------------------------------------------------------

    output_folder.mkdir(
        parents=True,
        exist_ok=True
    )

    # --------------------------------------------------------
    # Supported image formats
    # --------------------------------------------------------

    supported_extensions = {
        ".jpg",
        ".jpeg",
        ".png",
        ".webp",
        ".bmp",
        ".tif",
        ".tiff"
    }

    images = [
        file
        for file in input_folder.iterdir()
        if (
            file.is_file()
            and file.suffix.lower()
            in supported_extensions
        )
    ]

    # --------------------------------------------------------
    # Check images
    # --------------------------------------------------------

    if not images:

        print(
            "\nNo supported images found "
            "in the input folder."
        )

        return

    print()
    print(
        f"Found {len(images)} image(s)."
    )

    print(
        f"Maximum size: {max_size_mb:.2f} MB"
    )

    print(
        f"Output folder: {output_folder}"
    )

    print()
    print("=" * 60)

    # --------------------------------------------------------
    # Process images
    # --------------------------------------------------------

    successful = 0
    failed = 0

    for image_path in images:

        # Always output JPEG
        output_path = (
            output_folder
            / f"{image_path.stem}.jpg"
        )

        try:

            compress_image(
                image_path,
                output_path,
                max_size_mb
            )

            successful += 1

        except Exception as e:

            failed += 1

            print(
                f"  ✗ ERROR: {e}"
            )

    # --------------------------------------------------------
    # Summary
    # --------------------------------------------------------

    print()
    print("=" * 60)
    print("                    COMPLETE")
    print("=" * 60)

    print(
        f"Successful: {successful}"
    )

    print(
        f"Failed:     {failed}"
    )

    print(
        f"Output:     {output_folder}"
    )

    print("=" * 60)


# ============================================================
# RUN
# ============================================================

if __name__ == "__main__":
    main()