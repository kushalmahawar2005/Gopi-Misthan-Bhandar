'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { FiTrash2, FiSearch } from 'react-icons/fi';
import Pagination from '@/components/admin/Pagination';
import TableSkeleton from '@/components/admin/TableSkeleton';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  createdAt: string;
}

const ITEMS_PER_PAGE = 10;

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

  const tableRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced search - reset page and refetch
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      setCurrentPage(1);
    }, 400);

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [searchTerm]);

  const fetchUsers = useCallback(async () => {
    try {
      setPageLoading(true);
      const params = new URLSearchParams();
      params.set('page', String(currentPage));
      params.set('limit', String(ITEMS_PER_PAGE));

      if (searchTerm) {
        params.set('search', searchTerm);
      }

      const response = await fetch(`/api/users?${params.toString()}`);
      const data = await response.json();
      if (data.success) {
        setUsers(data.data);
        setTotalUsers(data.totalUsers || data.data.length);
        setTotalPages(data.totalPages || 1);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
      setPageLoading(false);
    }
  }, [currentPage, searchTerm]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Scroll to top of table on page change
  useEffect(() => {
    if (!loading && tableRef.current) {
      tableRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      const response = await fetch(`/api/users/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        fetchUsers();
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-red mx-auto mb-4"></div>
          <p className="text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" ref={tableRef}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-primary-brown font-general-sansal-sansal-sansal-sans">Users</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Manage user accounts</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red"
          />
        </div>
      </div>

      {/* Loading Skeleton for page transitions */}
      {pageLoading ? (
        <TableSkeleton columns={6} rows={ITEMS_PER_PAGE} />
      ) : (
        <>
          {/* Users Table - Desktop */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hidden md:block">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden lg:table-cell">
                      Phone
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden lg:table-cell">
                      Joined
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                        No users found
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-primary-brown">{user.name}</div>
                        </td>
                        <td className="px-4 lg:px-6 py-4">
                          <div className="text-sm text-primary-brown truncate max-w-xs">{user.email}</div>
                        </td>
                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-600 hidden lg:table-cell">
                          {user.phone || '-'}
                        </td>
                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                              user.role === 'admin'
                                ? 'bg-primary-red text-white border border-primary-red'
                                : 'bg-blue-100 text-blue-800 border border-blue-200'
                            }`}
                          >
                            {user.role}
                          </span>
                        </td>
                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-600 hidden lg:table-cell">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleDelete(user._id)}
                            className="p-2 text-primary-red hover:bg-red-50 rounded transition-colors"
                            title="Delete"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Users Cards - Mobile */}
          <div className="md:hidden space-y-4">
            {users.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                <p className="text-gray-500">No users found</p>
              </div>
            ) : (
              users.map((user) => (
                <div key={user._id} className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-primary-brown">{user.name}</h3>
                      <p className="text-xs text-gray-500 truncate mt-1">{user.email}</p>
                      {user.phone && (
                        <p className="text-xs text-gray-400 mt-1">Phone: {user.phone}</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDelete(user._id)}
                      className="p-2 text-primary-red hover:bg-red-50 rounded transition-colors flex-shrink-0"
                      title="Delete"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        user.role === 'admin'
                          ? 'bg-primary-red text-white border border-primary-red'
                          : 'bg-blue-100 text-blue-800 border border-blue-200'
                      }`}
                    >
                      {user.role}
                    </span>
                    <span className="text-xs text-gray-500">
                      Joined: {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* Pagination */}
      {totalUsers > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalUsers}
          limit={ITEMS_PER_PAGE}
          itemLabel="users"
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}
