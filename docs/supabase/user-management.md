# User Management System

## User Lifecycle Management

Complete user management system for the multi-user CV Generator platform with registration, onboarding, and account management features.

## User Registration Flow

### Sign Up Process
```typescript
// Multi-step registration with validation
function SignUpForm() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    agreeToTerms: false
  });

  const handleSignUp = async () => {
    // Step 1: Validate form
    if (!validateForm(formData)) return;

    // Step 2: Create account
    const { data, error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          full_name: formData.fullName,
          agreed_to_terms: formData.agreeToTerms
        }
      }
    });

    if (error) throw error;

    // Step 3: Email verification sent automatically
    setStep(2); // Show verification step
  };

  return (
    <div>
      {step === 1 && <RegistrationForm {...{formData, setFormData, handleSignUp}} />}
      {step === 2 && <EmailVerification email={formData.email} />}
    </div>
  );
}
```

### Email Verification
```typescript
// Handle email verification callback
function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error('Auth error:', error);
        navigate('/login');
        return;
      }

      if (data.session) {
        // Create user profile if it doesn't exist
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.session.user.id)
          .single();

        if (!profile) {
          // First time user - redirect to onboarding
          navigate('/onboarding');
        } else {
          // Returning user - redirect to dashboard
          navigate('/dashboard');
        }
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return <div>Verifying your email...</div>;
}
```

## User Onboarding

### Welcome Flow
```typescript
// Onboarding steps for new users
const onboardingSteps = [
  {
    title: 'Welcome to CV Pro!',
    component: WelcomeStep,
    description: 'Let\'s get your profile set up'
  },
  {
    title: 'Basic Information',
    component: BasicInfoStep,
    description: 'Tell us about yourself'
  },
  {
    title: 'First CV',
    component: CreateFirstCVStep,
    description: 'Create your first professional CV'
  },
  {
    title: 'All Set!',
    component: CompletionStep,
    description: 'You\'re ready to go'
  }
];

function OnboardingFlow() {
  const [currentStep, setCurrentStep] = useState(0);
  const [profileData, setProfileData] = useState({});

  const handleNext = async (stepData) => {
    setProfileData(prev => ({ ...prev, ...stepData }));

    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete onboarding
      await completeOnboarding(profileData);
    }
  };

  return (
    <div className="onboarding-container">
      <ProgressBar current={currentStep} total={onboardingSteps.length} />
      <div className="step-content">
        {React.createElement(onboardingSteps[currentStep].component, {
          onNext: handleNext,
          data: profileData
        })}
      </div>
    </div>
  );
}
```

## Account Management

### Profile Settings
```typescript
function ProfileSettings() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error loading profile:', error);
    } else {
      setProfile(data);
    }
    setLoading(false);
  };

  const updateProfile = async (updates) => {
    const { error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (error) {
      throw error;
    }

    // Update local state
    setProfile(prev => ({ ...prev, ...updates }));
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="profile-settings">
      <h2>Profile Settings</h2>

      <form onSubmit={handleSubmit(updateProfile)}>
        <div className="form-group">
          <label>Full Name</label>
          <input
            type="text"
            value={profile?.full_name || ''}
            onChange={(e) => setValue('full_name', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            value={profile?.email || ''}
            disabled // Email changes require verification
          />
          <small>Change email requires verification</small>
        </div>

        <div className="form-group">
          <label>Avatar</label>
          <AvatarUpload
            currentAvatar={profile?.avatar_url}
            onUpload={(url) => updateProfile({ avatar_url: url })}
          />
        </div>

        <button type="submit">Save Changes</button>
      </form>
    </div>
  );
}
```

### Password Management
```typescript
function PasswordSettings() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const updatePassword = async () => {
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    // First verify current password
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: (await supabase.auth.getUser()).data.user.email,
      password: currentPassword
    });

    if (signInError) {
      alert('Current password is incorrect');
      return;
    }

    // Update to new password
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      alert('Error updating password');
    } else {
      alert('Password updated successfully');
      // Clear form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  return (
    <div className="password-settings">
      <h3>Change Password</h3>
      <form onSubmit={updatePassword}>
        <input
          type="password"
          placeholder="Current password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="New password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Confirm new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <button type="submit">Update Password</button>
      </form>
    </div>
  );
}
```

## User Dashboard

### Personal Dashboard
```typescript
function UserDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    // Get user's CV statistics
    const { data: cvs, error } = await supabase
      .from('cvs')
      .select('id, title, created_at, updated_at, theme')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error loading dashboard:', error);
      return;
    }

    const stats = {
      totalCVs: cvs.length,
      recentCVs: cvs.slice(0, 5),
      themesUsed: [...new Set(cvs.map(cv => cv.theme).filter(Boolean))],
      lastUpdated: cvs[0]?.updated_at
    };

    setStats(stats);
  };

  return (
    <div className="dashboard">
      <h1>Welcome back, {user.user_metadata?.full_name}!</h1>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total CVs</h3>
          <p className="stat-number">{stats?.totalCVs || 0}</p>
        </div>

        <div className="stat-card">
          <h3>Themes Used</h3>
          <p>{stats?.themesUsed?.length || 0} different themes</p>
        </div>

        <div className="stat-card">
          <h3>Last Updated</h3>
          <p>{stats?.lastUpdated ? new Date(stats.lastUpdated).toLocaleDateString() : 'Never'}</p>
        </div>
      </div>

      <div className="recent-cvs">
        <h2>Recent CVs</h2>
        {stats?.recentCVs?.map(cv => (
          <div key={cv.id} className="cv-item">
            <h3>{cv.title}</h3>
            <p>Theme: {cv.theme || 'Default'}</p>
            <small>Updated: {new Date(cv.updated_at).toLocaleDateString()}</small>
          </div>
        ))}
      </div>
    </div>
  );
}
```

## Account Deletion

### Self-Service Account Deletion
```typescript
function DeleteAccount() {
  const { user } = useAuth();
  const [confirmText, setConfirmText] = useState('');
  const [loading, setLoading] = useState(false);

  const deleteAccount = async () => {
    if (confirmText !== 'DELETE') {
      alert('Please type DELETE to confirm');
      return;
    }

    setLoading(true);

    try {
      // Delete all user data
      await supabase.from('cvs').delete().eq('user_id', user.id);
      await supabase.from('experiences').delete().eq('user_id', user.id);
      await supabase.from('education').delete().eq('user_id', user.id);
      await supabase.from('skills').delete().eq('user_id', user.id);
      await supabase.from('profiles').delete().eq('id', user.id);

      // Delete auth user (admin only operation)
      await supabase.auth.admin.deleteUser(user.id);

      // Sign out
      await supabase.auth.signOut();

    } catch (error) {
      console.error('Error deleting account:', error);
      alert('Error deleting account. Please contact support.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="delete-account">
      <h3>Danger Zone</h3>
      <p>This action cannot be undone. All your CVs and data will be permanently deleted.</p>

      <div className="confirmation">
        <p>Type <strong>DELETE</strong> to confirm:</p>
        <input
          type="text"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder="DELETE"
        />
      </div>

      <button
        onClick={deleteAccount}
        disabled={loading || confirmText !== 'DELETE'}
        className="delete-button"
      >
        {loading ? 'Deleting...' : 'Delete Account'}
      </button>
    </div>
  );
}
```

## Admin User Management

### User Administration Interface
```typescript
function AdminUserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading users:', error);
    } else {
      setUsers(data);
    }
    setLoading(false);
  };

  const updateUserRole = async (userId, newRole) => {
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId);

    if (error) {
      alert('Error updating user role');
    } else {
      // Refresh users list
      loadUsers();
    }
  };

  const deactivateUser = async (userId) => {
    const { error } = await supabase
      .from('profiles')
      .update({ is_active: false })
      .eq('id', userId);

    if (error) {
      alert('Error deactivating user');
    } else {
      loadUsers();
    }
  };

  return (
    <div className="admin-users">
      <h2>User Management</h2>

      {loading ? (
        <div>Loading users...</div>
      ) : (
        <table className="users-table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Name</th>
              <th>Role</th>
              <th>CVs</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.email}</td>
                <td>{user.full_name}</td>
                <td>
                  <select
                    value={user.role}
                    onChange={(e) => updateUserRole(user.id, e.target.value)}
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td>{user.cv_count}</td>
                <td>{user.is_active ? 'Active' : 'Inactive'}</td>
                <td>
                  {user.is_active ? (
                    <button onClick={() => deactivateUser(user.id)}>
                      Deactivate
                    </button>
                  ) : (
                    <button onClick={() => updateUserRole(user.id, 'user')}>
                      Reactivate
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
```

## Migration from Single-User

### Data Migration Strategy
```python
def migrate_single_user_to_multi_user(admin_user_id: str):
    """
    Migrate existing single-user data to multi-user system
    """
    # Update all existing records to belong to admin user
    tables_to_update = ['cvs', 'experiences', 'education', 'skills']

    for table in tables_to_update:
        supabase.table(table).update({
            'user_id': admin_user_id
        }).is('user_id', None).execute()

    # Create admin profile
    supabase.table('profiles').insert({
        'id': admin_user_id,
        'email': 'admin@cv-pro.com',  # Will be updated
        'role': 'admin',
        'full_name': 'Administrator'
    }).execute()
```

### Feature Flags for Gradual Rollout
```python
# Feature flags for controlled rollout
FEATURE_FLAGS = {
    'multi_user': True,
    'user_registration': True,
    'admin_dashboard': False,  # Enable later
    'social_auth': False,     # Enable later
}

@app.middleware("http")
async def feature_flag_middleware(request, call_next):
    # Check feature flags for request
    if request.url.path.startswith('/admin') and not FEATURE_FLAGS['admin_dashboard']:
        return JSONResponse({'error': 'Feature not available'}, status_code=403)

    return await call_next(request)
```

This user management system provides a complete foundation for the multi-user CV Generator platform with proper authentication, authorization, and user lifecycle management.