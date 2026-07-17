# Kitchen Sink App · Automation Step · All Types Round Trip
#
# Exercises every `data_type` an automation-step input/output supports (10 in total):
#     string | boolean | number | date | datetime | email | phone_number | employee | entity | uuid
#
# For each input the script:
#   1. reads the value
#   2. logs the Python type it deserialized to via outputs.log() — run the step once and read
#      the step's log to see exactly what your script receives for each type
#   3. writes it straight back out on the matching output, unmodified — chain this step into
#      itself in a workflow to confirm values survive the round trip byte-for-byte
#
# Reading optional inputs: an input the workflow author leaves unmapped is absent from
# `inputs` entirely — the attribute doesn't exist (it is not None), so plain attribute access
# raises AttributeError. Use getattr(inputs, name, None) for any input that isn't declared
# `required: true`. Only `input_string` is required here, so only it is read directly.
#
# `input_uuid` is wired with input_source="variable" (the rest use "object_field") to show
# that hint_field_name works for variables too: the automation builder pre-selects the
# variable with that name, just as it pre-selects a record field for object_field inputs.


def log_and_passthrough(type_name, value):
    outputs.log(f"{type_name}: value={value!r} python_type={type(value).__name__}")
    return value


outputs.output_string = log_and_passthrough("string", inputs.input_string)
outputs.output_email = log_and_passthrough("email", getattr(inputs, "input_email", None))
outputs.output_boolean = log_and_passthrough("boolean", getattr(inputs, "input_boolean", None))
outputs.output_number = log_and_passthrough("number", getattr(inputs, "input_number", None))
outputs.output_date = log_and_passthrough("date", getattr(inputs, "input_date", None))
outputs.output_datetime = log_and_passthrough("datetime", getattr(inputs, "input_datetime", None))
outputs.output_phone_number = log_and_passthrough("phone_number", getattr(inputs, "input_phone_number", None))
outputs.output_employee = log_and_passthrough("employee", getattr(inputs, "input_employee", None))
outputs.output_entity = log_and_passthrough("entity", getattr(inputs, "input_entity", None))
outputs.output_uuid = log_and_passthrough("uuid", getattr(inputs, "input_uuid", None))

outputs.log("All 10 data types round-tripped successfully.")
