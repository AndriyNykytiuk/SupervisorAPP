name: Equipment Report API
description: Creates CRUD API for equipment reporting system.

## Stack
Express.js + Sequelize + MySQL

## Models

### VehicleType
- id: INTEGER AUTO_INCREMENT PRIMARY KEY
- name: STRING NOT NULL (e.g. "АЦ", "АНР", "АДР")

### EquipmentItem
- id: INTEGER AUTO_INCREMENT PRIMARY KEY
- number: INTEGER NOT NULL
- name: STRING NOT NULL
- unit: STRING NOT NULL (e.g. "шт.", "комп.")
- norm: INTEGER NOT NULL — кількість одиниць на 1 машину
- vehicleTypeId: FK → VehicleType

### EquipmentAvailability
- id: INTEGER AUTO_INCREMENT PRIMARY KEY
- equipmentItemId: FK → EquipmentItem
- brigadeId: FK → Brigade
- vehicleCount: INTEGER — кількість машин цього типу в бригаді
- available: INTEGER — кількість одиниць в наявності

## Associations
VehicleType hasMany EquipmentItem
EquipmentItem belongsTo VehicleType
EquipmentItem hasMany EquipmentAvailability
EquipmentAvailability belongsTo EquipmentItem
Brigade hasMany EquipmentAvailability
EquipmentAvailability belongsTo Brigade

## Roles & Access
GOD      → CRUD all
SEMI-GOD → read only (own detachment)
RW       → CRUD own brigade only

## URL Structure
/api/vehicle-types
/api/equipment-items?vehicleTypeId=:id
/api/equipment-availability?brigadeId=:id&vehicleTypeId=:id

## Routes needed

### VehicleType
GET    /api/vehicle-types         → getAll
POST   /api/vehicle-types         → create (GOD only)
DELETE /api/vehicle-types/:id     → delete (GOD only)

### EquipmentItem
GET    /api/equipment-items                    → getAll (filter by vehicleTypeId)
POST   /api/equipment-items                    → create (GOD only)
PUT    /api/equipment-items/:id                → update (GOD only)
DELETE /api/equipment-items/:id                → delete (GOD only)

### EquipmentAvailability
GET    /api/equipment-availability             → getAll (filter by brigadeId + vehicleTypeId)
POST   /api/equipment-availability             → create (RW own brigade, GOD all)
PUT    /api/equipment-availability/:id         → update (RW own brigade, GOD all)
DELETE /api/equipment-availability/:id         → delete (GOD only)

## Calculated fields (frontend only, never store in DB)
need     = item.norm * availability.vehicleCount
shortage = need - availability.available

## Controller pattern
export const getAll = async (req, res, next) => {
    try {
        const { vehicleTypeId, brigadeId } = req.query
        const where = {}
        if (vehicleTypeId) where.vehicleTypeId = vehicleTypeId
        // scope check for SEMI-GOD and RW
        const items = await EquipmentItem.findAll({ where, include: [...] })
        res.json(items)
    } catch (err) {
        next(err)
    }
}

## Frontend
- implement all data in GeneralRequirements.jsx

## postman
- create postman collection for all routes