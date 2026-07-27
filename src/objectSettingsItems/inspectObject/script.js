// Kitchen Sink App · Object Settings Item · Inspect Object
//
// Appears in the settings dropdown on an object's Record list page. Runs in the record-detail
// worker with an object context only: this.objectId is set, this.entityId is empty, so
// this.currentObject() works but this.currentEntity() is undefined. The return value is discarded;
// act through side effects. Shown only when config's `when` (over {{config.*}}) is true; that
// result is the object-settings visibility guard. config.json reads { label, api_name, when }.

const object = await this.currentObject();

if (!object) {
  return;
}

// object-detail always carries object_name/entity_name/object_type plus fields/related_objects.
const fieldCount = object.fields.length;
const relatedCount = object.related_objects.length;

this.console.log("Inspected object:", object);

this.showToast(
  `${object.object_name} (record: "${object.entity_name}") — ${object.object_type}, ${fieldCount} field(s), ${relatedCount} related object(s).`,
  { variant: "success", autohide: false },
);
