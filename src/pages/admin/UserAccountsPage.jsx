import ConfirmDialog from "@/components/shared/ConfirmDialog";
import DataTable     from "@/components/shared/DataTable";
import Avatar        from "@/components/ui/Avatar";
import Badge         from "@/components/ui/Badge";
import Button        from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";
import api           from "@/services/api";
import { useUIStore } from "@/store/useUIStore";
import { Ban, Users } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

export default function UserAccountsPage() {
  const { setPageTitle } = useUIStore();

  const [users,     setUsers]     = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [banTarget, setBanTarget] = useState(null);
  const [isBanning, setIsBanning] = useState(false);
  const [search,    setSearch]    = useState('');
  const [total,     setTotal]     = useState(0);

  const debounceRef = useRef(null);

  useEffect(() => { setPageTitle('User Accounts'); }, [setPageTitle]);

  // ── Core fetch ────────────────────────────────────────────────────────────
  // Stored in ref so useEffect can call it without dependency warnings
  const loadUsersRef = useRef(async (searchVal = '') => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ page: 1, limit: 20 });
      if (searchVal.trim()) params.set('search', searchVal.trim());
      const response = await api.get(`/admin/users?${params}`);
      setUsers(response.data.users ?? []);
      setTotal(response.data.total ?? 0);
    } catch (err) {
      console.error('[UserAccounts] Fetch error:', err);
      toast.error('Failed to load users.');
    } finally {
      setIsLoading(false);
    }
  });

  // Fetch on mount
  useEffect(() => {
    loadUsersRef.current('');
  }, []);

  // Search with debounce
  const handleSearch = (val) => {
    setSearch(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      loadUsersRef.current(val);
    }, 400);
  };

  // ── Ban / Unban ───────────────────────────────────────────────────────────
  const handleBanToggle = async () => {
    if (!banTarget) return;
    setIsBanning(true);
    const newStatus = banTarget.status === 'active' ? 'banned' : 'active';
    try {
      await api.patch(`/admin/users/${banTarget.id}/ban`, { status: newStatus });
      setUsers(prev => prev.map(u =>
        u.id === banTarget.id ? { ...u, status: newStatus } : u
      ));
      toast.success(
        newStatus === 'banned'
          ? `${banTarget.name} has been banned.`
          : `${banTarget.name} has been unbanned.`
      );
    } catch (err) {
      toast.error(err.message ?? 'Could not update user status.');
    } finally {
      setIsBanning(false);
      setBanTarget(null);
    }
  };

  // ── Table columns ─────────────────────────────────────────────────────────
  const columns = [
    {
      key: 'name', label: 'Customer', sortable: true,
      render: (v, row) => (
        <div className="flex items-center gap-3">
          <Avatar name={v} src={row.avatar_url} size="sm" />
          <div>
            <p className="text-sm font-medium text-brand-100 font-sans">{v}</p>
            <p className="text-xs text-brand-500 font-sans">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'status', label: 'Status',
      render: v => (
        <Badge variant={v === 'active' ? 'success' : 'danger'} dot>
          {v === 'active' ? 'Active' : 'Banned'}
        </Badge>
      ),
    },
    {
      key: 'created_at', label: 'Joined', sortable: true, muted: true,
      render: v => (
        <span className="text-sm font-sans text-brand-400">{formatDate(v)}</span>
      ),
    },
    {
      key: 'actions', label: '',
      render: (_, row) => (
        <Button
          variant={row.status === 'active' ? 'danger' : 'outline'}
          size="xs"
          iconLeft={<Ban className="size-3" />}
          onClick={() => setBanTarget(row)}
        >
          {row.status === 'active' ? 'Ban' : 'Unban'}
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="font-display text-2xl font-bold text-brand-50">User Accounts</h2>
          <p className="text-sm text-brand-400 font-sans mt-1">Manage registered customers.</p>
        </div>
        <Badge variant="default" size="lg">
          <Users className="size-3.5 mr-1" />
          {total} user{total !== 1 ? 's' : ''}
        </Badge>
      </div>

      <DataTable
        columns={columns}
        data={users}
        loading={isLoading}
        searchable
        searchPlaceholder="Search by name or email..."
        externalSearch={search}
        onSearch={handleSearch}
        emptyTitle="No users found"
        emptyIcon={<Users className="size-7" />}
        defaultPageSize={20}
      />

      <ConfirmDialog
        open={!!banTarget}
        onClose={() => setBanTarget(null)}
        onConfirm={handleBanToggle}
        loading={isBanning}
        title={banTarget?.status === 'active' ? 'Ban User' : 'Unban User'}
        description={
          banTarget?.status === 'active'
            ? `Ban ${banTarget?.name}? They will immediately lose access.`
            : `Restore access for ${banTarget?.name}?`
        }
        confirmLabel={banTarget?.status === 'active' ? 'Yes, Ban' : 'Yes, Unban'}
        variant={banTarget?.status === 'active' ? 'danger' : 'info'}
      />
    </div>
  );
}