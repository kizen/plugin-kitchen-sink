// Kitchen Sink App · Action · Record Data Explorer

// getObjectDetail fetches the object model (with related_objects[]);
// getEntity fetches the record
const [object, entity] = await Promise.all([
  this.getObjectDetail(this.objectId),
  this.getEntity(this.objectId, this.entityId), // #getEntity — direct call
]);

if (!object || !entity) {
  this.showToast("Couldn't load this record's object or entity.", {
    variant: "failure",
    autohide: false,
  });
  return;
}

this.console.log("getObjectDetail():", object);
this.console.log("getEntity():", entity);
this.console.log("related_objects:", object.related_objects);

const fieldIds = Object.keys(entity.fields ?? {}).slice(0, 5);

const sampledValues = {};

for (const fieldId of fieldIds) {
  sampledValues[fieldId] = this.getFieldValue(entity, fieldId);
}

this.console.log("getFieldValue() sample (first 5 fields):", sampledValues);

const relationshipField = object.related_objects?.[0];

let firstRelatedEntityId;

if (relationshipField) {
  const related = await this.getRelatedEntitiesForField(
    this.objectId,
    this.entityId,
    relationshipField.field_id,
  );

  this.console.log(
    `getRelatedEntitiesForField(field ${relationshipField.field_id}):`,
    related,
  );

  firstRelatedEntityId = related?.[0]?.id;
} else {
  this.console.log(
    "No relationship fields on this object — skipping getRelatedEntitiesForField.",
  );
}

// Refreshes the entity in the UI so the latest data is displayed - can refresh any entity by ID
this.refreshEntityForId(this.entityId);

// Refreshes the timeline for the host entity (the one being viewed when the script is run)
this.refreshTimeline();

// Refreshes the timeline for a specific entity by ID
this.refreshTimelineForId(firstRelatedEntityId ?? this.entityId);

this.showToast(
  "Explored this record via the RecordDetail API and triggered refreshes. Details in the browser console.",
  { variant: "success" },
);
