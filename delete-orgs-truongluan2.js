// Script to delete all organizations created by truongluan2
// First find the user
const user = db.users.findOne({username: 'truongluan2'});
print('User found:', user ? user._id : 'NOT FOUND');

if (user) {
  const userId = user._id;
  
  // Find all organizations owned by this user
  const orgs = db.organizations.find({ownerUserId: userId}).toArray();
  print('Found', orgs.length, 'organizations');
  
  orgs.forEach(org => {
    print('Deleting org:', org.name, '- ID:', org._id);
  });
  
  // Delete organizations
  const deleteResult = db.organizations.deleteMany({ownerUserId: userId});
  print('Deleted', deleteResult.deletedCount, 'organizations');
  
  // Delete memberships
  const membershipResult = db.organization_memberships.deleteMany({userId: userId});
  print('Deleted', membershipResult.deletedCount, 'memberships');
}
