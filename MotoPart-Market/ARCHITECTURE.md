# ESTRUCTURA DE CARPETAS:
moto-parts-market/
├── .gitignore
├── package.json
├── serverless.yml
├── src/
│   ├── handlers/
│   │   ├── createPart.js
│   │   └── getParts.js
│   ├── models/
│   │   └── Part.js
│   ├── repositories/
│   │   └── partRepository.js
│   └── business/
│       └── partService.js
├── scripts/
│   ├── seed-data.json
│   └── seed-dynamodb.js (opcional)
└── test/ (propuesto para Jest)
    ├── unit/
    │   └── partService.test.js
    └── integration/
        └── api.test.js