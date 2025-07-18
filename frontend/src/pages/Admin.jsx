import React, { useEffect, useState } from "react";
import { Trash2 } from "../components/Icons";

export const Admin = () => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    // Only check token for admin status
    const token = localStorage.getItem("token");
    if (!token) {
      setError("You do not have permission to view this page.");
      setLoading(false);
      return;
    }
    // Decode token to check is_admin
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (!payload.is_admin) {
      setError("You do not have permission to view this page.");
      setLoading(false);
      return;
    }
    fetch(`${API_URL}/users`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "error") throw new Error(data.message);
        setUsers(data.users);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [API_URL]);

  const handleRoleChange = (userId, field, value) => {
    // Decode token to get current user's email
    const token = localStorage.getItem("token");
    const payload = JSON.parse(atob(token.split(".")[1]));
    // Find the user being changed
    const changedUser = users.find((u) => u._id === userId);
    if (field === "is_admin" && value === true) {
      if (
        !window.confirm(
          "Are you sure you want to grant admin privileges to this user? Admins can manage other users and permissions."
        )
      ) {
        return;
      }
    }
    if (
      field === "is_admin" &&
      value === false &&
      changedUser &&
      changedUser.email === payload.email
    ) {
      if (
        !window.confirm(
          "You are about to remove admin privileges from your own account. You will lose access to this page. Are you sure you want to continue?"
        )
      ) {
        return;
      }
    }
    fetch(`${API_URL}/users/${userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ [field]: value }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success") {
          setUsers((prev) =>
            prev.map((u) => (u._id === userId ? { ...u, [field]: value } : u))
          );
        } else {
          throw new Error(data.message);
        }
      })
      .catch((err) => setError(err.message));
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4 ">Admin Permissions</h1>
      <table className="min-w-full border">
        <thead>
          <tr>
            <th className="border px-2 py-1">Name</th>
            <th className="border px-2 py-1">Email</th>
            <th className="border px-2 py-1">Authorized</th>
            <th className="border px-2 py-1">Admin</th>
            <th className="border px-2 py-1">Delete</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => {
            // Decode token to get current user's email
            const token = localStorage.getItem("token");
            const payload = JSON.parse(atob(token.split(".")[1]));
            const isSelf = user.email === payload.email;
            return (
              <tr key={user._id}>
                <td className="border px-2 py-1">{user.name}</td>
                <td className="border px-2 py-1">{user.email}</td>
                <td className="border px-2 py-1 text-center">
                  <label>
                    <input
                      type="radio"
                      name={`auth-${user._id}`}
                      checked={user.is_authorized === true}
                      onChange={() =>
                        handleRoleChange(user._id, "is_authorized", true)
                      }
                    />
                    Yes
                  </label>
                  <label className="ml-2">
                    <input
                      type="radio"
                      name={`auth-${user._id}`}
                      checked={user.is_authorized === false}
                      onChange={() =>
                        handleRoleChange(user._id, "is_authorized", false)
                      }
                    />
                    No
                  </label>
                </td>
                <td className="border px-2 py-1 text-center">
                  <label>
                    <input
                      type="radio"
                      name={`admin-${user._id}`}
                      checked={user.is_admin === true}
                      onChange={() =>
                        handleRoleChange(user._id, "is_admin", true)
                      }
                    />
                    Yes
                  </label>
                  <label className="ml-2">
                    <input
                      type="radio"
                      name={`admin-${user._id}`}
                      checked={user.is_admin === false}
                      onChange={() =>
                        handleRoleChange(user._id, "is_admin", false)
                      }
                    />
                    No
                  </label>
                </td>
                <td className="border px-2 py-1 text-center">
                  <button
                    className="text-red-600 hover:text-red-800 disabled:opacity-50"
                    disabled={isSelf}
                    title={
                      isSelf
                        ? "You cannot delete your own user account."
                        : "Delete user"
                    }
                    onClick={() => {
                      if (
                        window.confirm(
                          `Are you sure you want to delete user '${user.email}'? This action cannot be undone.`
                        )
                      ) {
                        fetch(`${API_URL}/users/${user._id}`, {
                          method: "DELETE",
                          headers: {
                            Authorization: `Bearer ${localStorage.getItem(
                              "token"
                            )}`,
                          },
                        })
                          .then((res) => res.json())
                          .then((data) => {
                            if (data.status === "success") {
                              setUsers((prev) =>
                                prev.filter((u) => u._id !== user._id)
                              );
                            } else {
                              throw new Error(data.message);
                            }
                          })
                          .catch((err) => setError(err.message));
                      }
                    }}
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
