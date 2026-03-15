import { Router } from "express";
import * as ctrl from "../controlers/testListController.js";
import { authorize } from "../middleware/authorize.js";

const router = Router();

// GET — any authenticated user can read all test lists
router.get("/", ctrl.getAll);
router.get("/:id", ctrl.getById);

// POST/PUT/DELETE — GOD only
router.post("/", authorize("GOD"), ctrl.create);
router.put("/:id", authorize("GOD"), ctrl.update);
router.delete("/:id", authorize("GOD"), ctrl.remove);

export default router;