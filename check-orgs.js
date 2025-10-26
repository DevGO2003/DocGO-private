// Check organizations for truongluan2
const user = db.users.findOne({username: 'truongluan2'});
print('=== USER INFO ===');
print('User ID:', user._id);
print('Username:', user.username);
print('Email:', user.email);
print('');

print('=== ORGANIZATIONS ===');
const orgs = db.organizations.find({ownerUserId: user._id}).toArray();
print('Total organizations:', orgs.length);
orgs.forEach((org, index) => {
    print(`\n--- Organization ${index + 1} ---`);
    print('ID:', org._id);
    print('Name:', org.name);
    print('Code:', org.code);
    print('Owner:', org.ownerUserId);
    print('Created:', org.createdAt);
});

print('\n=== INVITATIONS ===');
const invitations = db.invitations.find({}).toArray();
print('Total invitations:', invitations.length);
invitations.forEach((inv, index) => {
    print(`\n--- Invitation ${index + 1} ---`);
    print('ID:', inv._id);
    print('Organization:', inv.organizationId);
    print('Email:', inv.email);
    print('Token:', inv.token);
    print('Status:', inv.status);
    print('Invited by:', inv.invitedBy);
    print('Expires at:', inv.expiresAt);
});

print('\n=== MEMBERSHIPS ===');
const memberships = db.organization_memberships.find({}).toArray();
print('Total memberships:', memberships.length);
memberships.forEach((mem, index) => {
    print(`\n--- Membership ${index + 1} ---`);
    print('ID:', mem._id);
    print('Organization:', mem.organizationId);
    print('User:', mem.userId);
    print('Status:', mem.status);
});
