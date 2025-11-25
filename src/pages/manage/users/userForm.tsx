import { Alert } from 'react-bootstrap';

import { User, UserById } from '@/hooks/api/user';

const UserForm = ({ user }: { user: User | UserById | undefined }) => {
  return (
    <Alert>{user ? `Editing user: ${user.email}` : 'Loading user...'}</Alert>
  );
};

export { UserForm };
