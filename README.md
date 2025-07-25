# Health API

A RESTful API for managing health records, including user profiles, medical records, medications, and vital signs.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory with the following content:
```env
PORT=3000
MONGODB_URI=your_mongodb_connection_string
```

3. Start the server:
- Development mode: `npm run dev`
- Production mode: `npm start`

## API Endpoints

### User Profiles

- **POST** `/api/profiles`
  - Create a new user profile
  - Body: { username, dateOfBirth, height?, weight?, bloodType?, medicalConditions?, allergies?, medications?, emergencyContactName?, emergencyContactNumber? }

- **GET** `/api/profiles`
  - Get all profiles

- **GET** `/api/profiles/:id`
  - Get a specific profile by ID

- **PUT** `/api/profiles/:id`
  - Update a profile
  - Body: { username?, dateOfBirth?, height?, weight?, bloodType?, medicalConditions?, allergies?, medications?, emergencyContactName?, emergencyContactNumber? }

- **DELETE** `/api/profiles/:id`
  - Delete a profile

### Medical Records

- **POST** `/api/medical-records`
  - Create a new medical record
  - Body: { profileId, visitDate, doctorName, diagnosis, symptoms?, treatment?, notes?, followUpDate?, attachments? }

- **GET** `/api/medical-records/profile/:profileId`
  - Get all medical records for a profile

- **GET** `/api/medical-records/:id`
  - Get a specific medical record

- **PUT** `/api/medical-records/:id`
  - Update a medical record
  - Body: { visitDate?, doctorName?, diagnosis?, symptoms?, treatment?, notes?, followUpDate?, attachments? }

- **DELETE** `/api/medical-records/:id`
  - Delete a medical record

### Medications

- **POST** `/api/medications`
  - Create a new medication record
  - Body: { profileId, name, dosage, frequency, startDate, endDate?, prescribedBy?, purpose?, sideEffects?, active?, notes? }

- **GET** `/api/medications/profile/:profileId`
  - Get all medications for a profile

- **GET** `/api/medications/profile/:profileId/active`
  - Get active medications for a profile

- **GET** `/api/medications/:id`
  - Get a specific medication

- **PUT** `/api/medications/:id`
  - Update a medication
  - Body: { name?, dosage?, frequency?, startDate?, endDate?, prescribedBy?, purpose?, sideEffects?, active?, notes? }

- **DELETE** `/api/medications/:id`
  - Delete a medication

### Vital Signs

- **POST** `/api/vital-signs`
  - Create a vital signs record
  - Body: { profileId, date?, bloodPressure?, heartRate?, respiratoryRate?, temperature?, oxygenSaturation?, bloodGlucose?, weight?, notes?, recordedBy? }

- **GET** `/api/vital-signs/profile/:profileId`
  - Get all vital signs for a profile

- **GET** `/api/vital-signs/profile/:profileId/latest`
  - Get latest vital signs for a profile

- **GET** `/api/vital-signs/profile/:profileId/range?startDate=&endDate=`
  - Get vital signs within a date range

- **GET** `/api/vital-signs/:id`
  - Get a specific vital signs record

- **PUT** `/api/vital-signs/:id`
  - Update a vital signs record
  - Body: { date?, bloodPressure?, heartRate?, respiratoryRate?, temperature?, oxygenSaturation?, bloodGlucose?, weight?, notes?, recordedBy? }

- **DELETE** `/api/vital-signs/:id`
  - Delete a vital signs record

## Data Models

### UserProfile
```javascript
{
  username: String (required),
  dateOfBirth: Date (required),
  height: Number,
  weight: Number,
  bloodType: String,
  medicalConditions: String,
  allergies: String,
  medications: String,
  emergencyContactName: String,
  emergencyContactNumber: String,
  timestamps: true
}
```

### MedicalRecord
```javascript
{
  profileId: ObjectId (required, ref: 'Profile'),
  visitDate: Date (required),
  doctorName: String (required),
  diagnosis: String (required),
  symptoms: [String],
  treatment: String,
  notes: String,
  followUpDate: Date,
  attachments: [String],
  timestamps: true
}
```

### Medication
```javascript
{
  profileId: ObjectId (required, ref: 'Profile'),
  name: String (required),
  dosage: String (required),
  frequency: String (required),
  startDate: Date (required),
  endDate: Date,
  prescribedBy: String,
  purpose: String,
  sideEffects: [String],
  active: Boolean,
  notes: String,
  timestamps: true
}
```

### VitalSigns
```javascript
{
  profileId: ObjectId (required, ref: 'Profile'),
  date: Date (required, default: Date.now),
  bloodPressure: {
    systolic: Number,
    diastolic: Number
  },
  heartRate: Number,
  respiratoryRate: Number,
  temperature: Number,
  oxygenSaturation: Number,
  bloodGlucose: Number,
  weight: Number,
  notes: String,
  recordedBy: String,
  timestamps: true
}
```

## Error Handling

The API returns appropriate HTTP status codes and error messages:

- 200: Success
- 201: Created
- 400: Bad Request
- 404: Not Found
- 500: Internal Server Error

## Security Considerations

1. Store sensitive data securely
2. Use environment variables for configuration
3. Implement proper authentication and authorization
4. Validate and sanitize all inputs
5. Use HTTPS in production
6. Implement rate limiting for API endpoints
⌢瀠瑡敩瑮扟捡敫摮•਍