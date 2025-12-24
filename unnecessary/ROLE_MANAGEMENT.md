# Jiwandan Blood Bank System

A comprehensive blood bank management system built with React and Firebase.

## User Role Management

The system has a hierarchical role structure to ensure secure and efficient management:

### User Roles

1. **Super Admin** - Has complete control over the system
   - Can create admin accounts
   - Can manage all users and user roles
   - Can approve/deny deletion requests
   - Can configure system-wide settings

2. **Admin** - Manages the overall system
   - Can create moderator and volunteer accounts
   - Can manage users (except superadmins)
   - Can request user deletion (requires superadmin approval)

3. **Moderator** - Handles content moderation
   - Can manage volunteer and regular user accounts
   - Can approve/deny verification requests
   - Can handle user reports
   - Can suspend/ban users for violations

4. **Volunteer** - Blood bank staff
   - Can view and manage donors
   - Can add blood donation events
   - Can send notifications to eligible donors
   - Can view user donation history

5. **Donor** - Regular blood donor
   - Can register for donation events
   - Can view their donation history
   - Can update their profile and availability status

6. **User** - Basic system user
   - Can register and create a profile
   - Can view blood donation events
   - Can request emergency blood

### Creating Special Role Accounts

Use the provided scripts to create special role accounts:

```bash
# Create a superadmin account (highest privileges)
./make-superadmin.sh email@example.com

# Create a moderator account
./make-moderator.sh email@example.com

# Create a volunteer account
./make-volunteer.sh email@example.com
```

Note: These scripts should only be run by the system administrator.

## Features by Role

### Super Admin Features

- System-wide settings management
- User role management
- Deletion request approval
- System statistics dashboard

### Admin Features

- Create moderator and volunteer accounts
- Manage all users (except superadmins)
- View system statistics
- Request account deletion

### Moderator Features

- Approve/reject verification requests
- Manage volunteer and regular users
- Handle user reports
- Suspend/ban users for violations

### Volunteer Features

- Create blood donation events
- Manage donors and their information
- Send notifications to eligible donors
- View donation statistics

### Donor Features

- Update availability status
- View donation history
- Register for donation events
- Update personal information

### User Features

- Register and create profile
- Browse donation centers
- View upcoming blood donation events
- Request emergency blood
