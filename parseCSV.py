import csv
import json
from collections import defaultdict

INPUT_CSV = "master-course-list.csv"
OUTPUT_JSON = "courses_indexed.json"

# All possible tag columns (AREA now included)
TAG_COLUMNS = ["Area", "Econ", "Tech", "Intel", "IS", "Mil Ops", "TSV", "USNP", "Other"]

courses = []
tag_index = defaultdict(list)

with open(INPUT_CSV, newline="", encoding="utf-8") as f:
    reader = csv.DictReader(f)

    for row in reader:
        # Collect tags where the cell is non-empty
        tags = [col.upper().replace(" ", "") for col in TAG_COLUMNS if row[col].strip() != ""]

        # Build course object — no "area" key now
        course = {
            "number": row["Course Number"].strip(),
            "name": row["Course Name"].strip(),
            "tags": tags,
            "notes": row["Notes"].strip() if row["Notes"] else None
        }

        courses.append(course)

        # Add course to each tag index entry (keep full tag info)
        for tag in tags:
            tag_index[tag].append({
                "number": course["number"],
                "name": course["name"],
                "tags": tags
            })

# Convert to normal dict for JSON serialization
tag_index = dict(tag_index)

# Final combined output
output_data = {
    "courses": courses,
    "byTag": tag_index
}

# Write to JSON
with open(OUTPUT_JSON, "w", encoding="utf-8") as out:
    json.dump(output_data, out, indent=2)

print(f"✅ Created {OUTPUT_JSON} with {len(courses)} courses and {len(tag_index)} tags.")
