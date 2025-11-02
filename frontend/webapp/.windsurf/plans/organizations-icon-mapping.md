# Organizations Icon Mapping Guide

## Lucide → CommonIcon Mapping

```typescript
// Import replacement
OLD: import { Icon1, Icon2 } from 'lucide-react';
NEW: import { CommonIcon } from '@shared/components/UIComponents/Icon/CommonIcon';

// Usage replacement
OLD: <Icon1 className="w-4 h-4" />
NEW: <CommonIcon name="icon-1" size={16} />

OLD: <Icon2 size={20} className="text-blue-600" />
NEW: <CommonIcon name="icon-2" size={20} color="#2563eb" />
```

## Complete Icon Mapping Table

| Lucide | CommonIcon | Size | Notes |
|--------|------------|------|-------|
| `Shield` | `shield` | 16-20 | Role badge |
| `Users` / `UsersIcon` | `users` | 16-20 | Manager role |
| `User` | `user` | 16-20 | Member role |
| `UserPlus` | `user-plus` | 16-20 | Invite member |
| `UserCheck` | `user-check` | 16-20 | Accept invitation |
| `UserCog` | `user-cog` | 16-20 | User settings |
| `Trash2` | `trash` | 16 | Delete action |
| `Plus` | `plus` | 16-20 | Add new |
| `Search` | `search` | 20 | Search |
| `Building2` | `building` | 20-24 | Organization |
| `Calendar` | `calendar` | 16 | Date |
| `Crown` | `crown` | 16-20 | Owner role |
| `MoreVertical` | `more-vertical` | 16 | Actions menu |
| `Mail` | `mail` | 16-20 | Email/Invitation |
| `X` | `x` | 16 | Close |
| `Loader2` | `loading` | 16-20 | Loading state |
| `AlertCircle` | `alert-circle` | 16-20 | Alert/Warning |
| `Scale` | `scale` | 16 | Legal permission |
| `DollarSign` | `dollar-sign` | 16 | Finance permission |
| `Briefcase` | `briefcase` | 16 | HR permission |
| `Settings` | `settings` | 16 | Settings permission |
| `Check` | `check` | 16 | Selected/Confirmed |
| `ChevronDown` | `chevron-down` | 16 | Dropdown |
| `Edit` | `edit` | 16 | Edit action |
| `Lock` | `lock` | 16 | Lock/Permission |
| `EyeOff` | `eye-off` | 16 | Hidden |
| `Folder` | `folder` | 16-20 | Folder |
| `ArrowLeft` | `arrow-left` | 20 | Back navigation |

## Files to Fix (13 total)

### Components (7 files)

1. ✅ **RoleBadge.tsx** - DONE
   - Shield → shield
   - Users → users
   - User → user

2. ⏳ **PermissionBadge.tsx**
   ```typescript
   // OLD
   import { Scale, DollarSign, Briefcase, UserPlus, Settings } from 'lucide-react';
   
   // NEW
   import { CommonIcon } from '@shared/components/UIComponents/Icon/CommonIcon';
   
   // Replace usage:
   <Scale className="w-4 h-4" /> → <CommonIcon name="scale" size={16} />
   <DollarSign ... /> → <CommonIcon name="dollar-sign" size={16} />
   <Briefcase ... /> → <CommonIcon name="briefcase" size={16} />
   <UserPlus ... /> → <CommonIcon name="user-plus" size={16} />
   <Settings ... /> → <CommonIcon name="settings" size={16} />
   ```

3. ⏳ **PermissionGuard.tsx**
   ```typescript
   // OLD
   import { AlertCircle } from 'lucide-react';
   
   // NEW
   import { CommonIcon } from '@shared/components/UIComponents/Icon/CommonIcon';
   
   // Replace:
   <AlertCircle ... /> → <CommonIcon name="alert-circle" size={20} />
   ```

4. ⏳ **MemberTable.tsx**
   ```typescript
   // OLD
   import { MoreVertical, Trash2, Edit, Shield, AlertCircle } from 'lucide-react';
   
   // Replace:
   <MoreVertical ... /> → <CommonIcon name="more-vertical" size={16} />
   <Trash2 ... /> → <CommonIcon name="trash" size={16} />
   <Edit ... /> → <CommonIcon name="edit" size={16} />
   <Shield ... /> → <CommonIcon name="shield" size={16} />
   <AlertCircle ... /> → <CommonIcon name="alert-circle" size={16} />
   ```

5. ⏳ **MemberManagementModal.tsx**
   ```typescript
   // OLD
   import { Shield, Lock, X } from 'lucide-react';
   
   // Replace:
   <Shield ... /> → <CommonIcon name="shield" size={16} />
   <Lock ... /> → <CommonIcon name="lock" size={16} />
   <X ... /> → <CommonIcon name="x" size={16} />
   ```

6. ⏳ **InviteMemberModal.tsx**
   ```typescript
   // OLD
   import { UserPlus, AlertCircle, Mail, CheckCircle } from 'lucide-react';
   
   // Replace:
   <UserPlus ... /> → <CommonIcon name="user-plus" size={20} />
   <AlertCircle ... /> → <CommonIcon name="alert-circle" size={16} />
   <Mail ... /> → <CommonIcon name="mail" size={16} />
   <CheckCircle ... /> → <CommonIcon name="check" size={16} />
   ```

7. ⏳ **CreateOrganizationDialog.tsx**
   ```typescript
   // OLD
   import { Building2, AlertCircle } from 'lucide-react';
   
   // Replace:
   <Building2 ... /> → <CommonIcon name="building" size={20} />
   <AlertCircle ... /> → <CommonIcon name="alert-circle" size={16} />
   ```

### Special: OrganizationSelector.tsx (framer-motion)

```typescript
// OLD
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, ChevronDown, Check, Plus, Crown, UserCog, Shield } from 'lucide-react';

// NEW
import { CommonIcon } from '@shared/components/UIComponents/Icon/CommonIcon';
// Remove framer-motion, use CSS transitions

// Icon replacements:
<Building2 ... /> → <CommonIcon name="building" size={20} />
<ChevronDown ... /> → <CommonIcon name="chevron-down" size={16} />
<Check ... /> → <CommonIcon name="check" size={16} />
<Plus ... /> → <CommonIcon name="plus" size={16} />
<Crown ... /> → <CommonIcon name="crown" size={16} />
<UserCog ... /> → <CommonIcon name="user-cog" size={16} />
<Shield ... /> → <CommonIcon name="shield" size={16} />

// Animation replacements:
<motion.div ... /> → <div className="transition-all duration-300" />
<AnimatePresence> → Remove, use CSS
```

### Pages (6 files)

8. ⏳ **AcceptInvitation.tsx**
   ```typescript
   // OLD
   import { Mail, Building2, UserCheck, X, Loader2 } from 'lucide-react';
   
   // Replace:
   <Mail ... /> → <CommonIcon name="mail" size={24} />
   <Building2 ... /> → <CommonIcon name="building" size={24} />
   <UserCheck ... /> → <CommonIcon name="user-check" size={24} />
   <X ... /> → <CommonIcon name="x" size={20} />
   <Loader2 ... /> → <CommonIcon name="loading" size={20} />
   ```

9. ⏳ **OrganizationDetail.tsx**
   ```typescript
   // OLD
   import { ..., Crown, Calendar, MoreVertical } from 'lucide-react';
   
   // Replace all icon usages
   ```

10. ⏳ **OrganizationList.tsx** (framer-motion)
    ```typescript
    // OLD
    import { motion } from 'framer-motion';
    import { Plus, Search, Building2, Users, Crown, Calendar, Shield, UserCog } from 'lucide-react';
    
    // Remove motion, use CSS transitions
    // Replace all 8 icons
    ```

11. ⏳ **OrganizationMembers.tsx**
    ```typescript
    // OLD
    import { UserPlus, ArrowLeft, Users as UsersIcon, Trash2 } from 'lucide-react';
    
    // Replace:
    <UserPlus ... /> → <CommonIcon name="user-plus" size={20} />
    <ArrowLeft ... /> → <CommonIcon name="arrow-left" size={20} />
    <UsersIcon ... /> → <CommonIcon name="users" size={20} />
    <Trash2 ... /> → <CommonIcon name="trash" size={16} />
    ```

12. ⏳ **OrganizationWorkspace.tsx** (multiple icons)
    ```typescript
    // OLD
    import { ..., EyeOff, Crown, Folder } from 'lucide-react';
    
    // Replace:
    <EyeOff ... /> → <CommonIcon name="eye-off" size={16} />
    <Crown ... /> → <CommonIcon name="crown" size={16} />
    <Folder ... /> → <CommonIcon name="folder" size={20} />
    // + more icons
    ```

## Quick Fix Pattern

For each file:

1. **Remove lucide/framer imports**
   ```typescript
   - import { Icon1, Icon2 } from 'lucide-react';
   - import { motion } from 'framer-motion';
   + import { CommonIcon } from '@shared/components/UIComponents/Icon/CommonIcon';
   ```

2. **Replace icon usage**
   - Find: `<IconName className="w-X h-X" />`
   - Replace: `<CommonIcon name="icon-name" size={X*4} />`
   - Size conversion: w-4 h-4 = 16px, w-5 h-5 = 20px, w-6 h-6 = 24px

3. **Replace motion components** (if exists)
   - `motion.div` → `div` with CSS classes
   - Add: `className="transition-all duration-300"`
   - Remove: `AnimatePresence`, `variants`, `initial`, `animate`

## Progress Tracking

- [x] Icons added: 17 new icons
- [x] Total icons: 55
- [x] RoleBadge.tsx (1/13)
- [ ] PermissionBadge.tsx (2/13)
- [ ] PermissionGuard.tsx (3/13)
- [ ] MemberTable.tsx (4/13)
- [ ] MemberManagementModal.tsx (5/13)
- [ ] InviteMemberModal.tsx (6/13)
- [ ] CreateOrganizationDialog.tsx (7/13)
- [ ] OrganizationSelector.tsx (8/13) - has framer-motion
- [ ] AcceptInvitation.tsx (9/13)
- [ ] OrganizationDetail.tsx (10/13)
- [ ] OrganizationList.tsx (11/13) - has framer-motion
- [ ] OrganizationMembers.tsx (12/13)
- [ ] OrganizationWorkspace.tsx (13/13)

---

**Estimated time remaining**: ~20 phút (12 files * 1.5 phút)
