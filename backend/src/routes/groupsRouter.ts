import * as express from "express";
import { GroupControllerImp } from "../controller/GroupController";
import { Path } from "controller/PathController";

const groupsRouter: express.Router = express.Router();
const controller = new GroupControllerImp();

// gets all the groups in the database
groupsRouter.get("/", (req, res, next) => {
  try {
    const allGroups = controller.getGroups();

    const responseObj = JSON.stringify({ groups: allGroups });
    res.json(responseObj);
  } catch (error) {
    console.log(error);
    res.status(400);
  }
});

// sets the path of the specific group to the pathID given in the body,
// also in the request body is whether or not to override the path assignment
groupsRouter.put("/:groupID", (req, res, next) => {
  try {
    const groupID = Number(req.params.id);
    const pathID = Number(req.body.pathID);

    if (req.body.override) {
      controller.setPath(pathID, groupID, true);
    } else {
      try {
        controller.setPath(pathID, groupID);
      } catch (error) {
        res.status(400).send(error);
      }
    }

    const responseObj = JSON.stringify({ pathID: pathID, groupID: groupID });
    res.json(responseObj);
  } catch (error) {
    console.log(error);
    res.status(400);
  }
});

// sends the id of the path of a specific group in the database based off the given ID
groupsRouter.get("/:groupID", (req, res, next) => {
  try {
    const groupID = Number(req.params.groupID);

    const pathID: number = controller.getGroupPath(groupID);

    res.json(JSON.stringify({ pathID: pathID }));
  } catch (error) {
    console.log(error);
    res.status(400);
  }
});

// adds a group to the database, JSON with group name in request body
groupsRouter.post("/", (req, res, next) => {
  try {
    const groupName = req.body.name;
    const groupID = controller.createGroup(groupName);
    res.json(JSON.stringify({ groupID: groupID }));
  } catch (error) {
    console.log(error);
    res.status(400);
  }
});

// deletes the group specified by the given ID
groupsRouter.delete("/:groupID", (req, res, next) => {
  try {
    const groupID = Number(req.params.groupID);
    const deletedGroup = controller.deleteGroup(groupID);

    res.json(
      JSON.stringify({
        name: deletedGroup.getName(),
        path: deletedGroup.getPath(),
      })
    );
  } catch (error) {
    console.log(error);
    res.status(400);
  }
});

// changes the group name of the group specified by the ID, name in request body
groupsRouter.put("/:groupID", (req, res, next) => {
  const groupID = Number(req.params.groupID);
  const newName = req.body.name;
  try {
    controller.changeGroupName(groupID, newName);
    res.json(JSON.stringify({ groupID: groupID }));
  } catch (error) {
    res.status(400).send("broken");
    console.log(error);
  }
});

export default groupsRouter;