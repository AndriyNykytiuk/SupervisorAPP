## Контекст проекту
- Стек: Express.js + Sequelize + MySQL + React/Vite
- Ролі: GOD / SEMI-GOD / RW
- Існуючі моделі: Brigade, Detachment, User, BrigadeVechicle, EquipmentAvailability, EquipmentItem

## Що треба зробити
filter  and summ total_need for every brigade in detacment and summary total_need for all detacments 

## Моделі які задіяні
Brigade, Detachment, User, BrigadeVechicle, EquipmentAvailability, EquipmentItem


## Поведінка по ролях
- GOD → all detacments -> table with totalneedfor every detacment and summary total_need for all detacments 
- SEMI-GOD → тільки читання свого відділення table with totalneedfor every brigDE in his detacment and summary total_need for this detacments 
- RW → have not this oportunity

## Ендпоінти які потрібні
// GET /api/equipment-availability?brigadeId=&vehicleTypeId=



## Що вже є (не треба робити)
- authenticate middleware
- Brigade/Detachment моделі
- req.scope для перевірки ролей

## Очікуваний результат
when user  SEMI-GOD open GeneralRequirements.jsx  he see button after click on it appear table with total_need for every brigade in detachment and summary total_need for this detachment. when user God open GeneralRequirements.jsx  he see button after click on it appear table with total_need for every detachment and summary total_need for all detachments