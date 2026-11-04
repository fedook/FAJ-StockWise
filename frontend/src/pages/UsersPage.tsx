import { useCallback, useEffect, useState } from 'react'
import { LoaderCircle, RefreshCw,  Trash2, Users } from 'lucide-react'
import Alert from '../components/ui/Alert'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import PageHeader from '../components/ui/PageHeader'
import { useAuth } from '../hooks/useAuth'
import * as userService from '../services/user.service'
import type { AuthUser, UserRole } from '../types/auth'
import { getErrorMessage } from '../utils/getErrorMessage'

function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export default function UsersPage() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState<AuthUser[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<number | null>(null)
  const [confirmingId, setConfirmingId] = useState<number | null>(null)
  const [pageError, setPageError] = useState<string | null>(null)

  const loadUsers = useCallback(async () => {
    setLoading(true)
    setPageError(null)

    try {
      const data = await userService.listUsers()
      setUsers(data)
    } catch (error) {
      setPageError(getErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // Fetching on mount is the intended "sync with an external system" effect.
    // oxlint-disable-next-line react/set-state-in-effect
    void loadUsers()
  }, [loadUsers])

  async function handleRoleChange(id: number, role: UserRole) {
    setBusyId(id)
    setPageError(null)

    try {
      const updated = await userService.updateUserRole(id, role)
      setUsers((current) =>
        current.map((user) => (user.id === id ? updated : user)),
      )
    } catch (error) {
      setPageError(getErrorMessage(error))
    } finally {
      setBusyId(null)
    }
  }

  async function handleDelete(id: number) {
    setBusyId(id)
    setPageError(null)

    try {
      await userService.deleteUser(id)
      setUsers((current) => current.filter((user) => user.id !== id))
      setConfirmingId(null)
    } catch (error) {
      setPageError(getErrorMessage(error))
    } finally {
      setBusyId(null)
    }
  }

  const adminCount = users.filter((user) => user.role === 'admin').length

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        description={`${users.length} account${
          users.length === 1 ? '' : 's'
        } · ${adminCount} admin${
          adminCount === 1 ? '' : 's'
        }. Staff accounts cannot open this page or call the users API.`}
        badge={{ icon: Users, label: 'Admin only' }}
        actions={
          <Button
            variant="secondary"
            onClick={() => void loadUsers()}
            loading={loading}
          >
            <RefreshCw size={16} aria-hidden />
            Reload
          </Button>
        }
      />

      {pageError && <Alert tone="error">{pageError}</Alert>}

      <div className="overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-sm">
        {loading && users.length === 0 ? (
          <div className="flex items-center justify-center gap-3 px-6 py-16 text-sm text-ink-500">
            <LoaderCircle size={20} className="animate-spin text-brand-600" aria-hidden />
            Loading accounts...
          </div>
        ) : users.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No accounts found"
            description="User accounts will appear here once they are created."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-ink-200 bg-ink-50/80 text-xs font-semibold uppercase tracking-wide text-ink-500">
                  <th scope="col" className="px-5 py-3">
                    User
                  </th>
                  <th scope="col" className="px-5 py-3">
                    Role
                  </th>
                  <th scope="col" className="px-5 py-3">
                    Joined
                  </th>
                  <th scope="col" className="px-5 py-3 text-right">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {users.map((user) => {
                  const isSelf = user.id === currentUser?.id
                  const isBusy = busyId === user.id
                  const isConfirming = confirmingId === user.id

                  return (
                    <tr
                      key={user.id}
                      className="border-b border-ink-100 transition-colors last:border-0 hover:bg-brand-50/30"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <span
                            aria-hidden
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-900 text-sm font-semibold text-white"
                          >
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                          <div className="min-w-0">
                            <p className="flex items-center gap-2 font-medium text-ink-900">
                              <span className="truncate">{user.name}</span>
                              {isSelf && (
                                <span className="rounded-full bg-ink-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-ink-500">
                                  You
                                </span>
                              )}
                            </p>
                            <p className="truncate text-xs text-ink-500">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <label className="sr-only" htmlFor={`role-${user.id}`}>
                          Role for {user.name}
                        </label>
                        <select
                          id={`role-${user.id}`}
                          value={user.role}
                          disabled={isBusy || isSelf}
                          title={
                            isSelf
                              ? 'You cannot change your own role.'
                              : 'Change this account role'
                          }
                          onChange={(event) =>
                            void handleRoleChange(
                              user.id,
                              event.target.value as UserRole,
                            )
                          }
                          className="rounded-lg border border-ink-200 bg-white px-2.5 py-1.5 text-sm capitalize text-ink-700 shadow-sm transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <option value="admin">Admin</option>
                          <option value="staff">Staff</option>
                        </select>
                      </td>

                      <td className="px-5 py-4 text-ink-600">
                        {formatDate(user.createdAt)}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {isConfirming ? (
                            <>
                              <Button
                                variant="ghost"
                                onClick={() => setConfirmingId(null)}
                                disabled={isBusy}
                              >
                                Cancel
                              </Button>
                              <Button
                                variant="danger"
                                loading={isBusy}
                                onClick={() => void handleDelete(user.id)}
                              >
                                Confirm delete
                              </Button>
                            </>
                          ) : (
                            <Button
                              variant="ghost"
                              disabled={isSelf || isBusy}
                              title={
                                isSelf
                                  ? 'You cannot delete your own account.'
                                  : 'Delete this account'
                              }
                              onClick={() => setConfirmingId(user.id)}
                            >
                              {isBusy ? (
                                <LoaderCircle
                                  size={16}
                                  className="animate-spin"
                                  aria-hidden
                                />
                              ) : (
                                <Trash2 size={16} aria-hidden />
                              )}
                              Delete
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  )
}
