// Kitchen Sink App · Action · Related Record Context
//
// Demonstrates the two records an action can see:
//   HOST          - the record you're running the script from: this.objectId/entityId, this.currentObject()/currentEntity()
//   ACTION TARGET - the record the action was invoked against (a related row, when run from one):
//                   this.actionObjectId/actionEntityId, this.actionEntity()
//
// From a plain record action action-target ids are empty

this.console.log(
  "HOST objectId / entityId:",
  this.objectId,
  "/",
  this.entityId,
);

this.console.log(
  "ACTION-TARGET actionObjectId / actionEntityId:",
  this.actionObjectId,
  "/",
  this.actionEntityId,
);

const hasActionTarget = Boolean(this.actionObjectId && this.actionEntityId);

// Concurrently fetch the host entity and the action target entity (if present)
const [hostEntity, targetEntity] = await Promise.all([
  this.currentEntity(),
  hasActionTarget ? this.actionEntity() : Promise.resolve(undefined),
]);

this.console.log("currentEntity() [host]:", hostEntity);
this.console.log("actionEntity() [action target]:", targetEntity);

if (!hasActionTarget) {
  this.showToast(
    "No distinct action target, this was likely run against the host record itself. Invoke it from a related record's action to see the target diverge.",
    { variant: "success" },
  );
  return;
}

const targetLabel =
  targetEntity?.display_name ?? targetEntity?.name ?? this.actionEntityId;

this.showToast(
  `Host entity ${this.entityId} · action target "${targetLabel}" (${this.actionEntityId}). Full records are in the console.`,
  { variant: "success" },
);
