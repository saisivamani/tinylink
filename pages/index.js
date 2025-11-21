import { useState, useEffect } from "react";

const CODE_RE = /^[A-Za-z0-9]{6,8}$/;

export default function Dashboard() {
  const [links, setLinks] = useState([]);
  const [targetUrl, setTargetUrl] = useState("");
  const [customCode, setCustomCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info"); // "info" | "success" | "error"
  const [codeError, setCodeError] = useState(false);
  const [search, setSearch] = useState("");

  async function fetchLinks() {
    try {
      const res = await fetch("/api/links");
      if (!res.ok) throw new Error(`Failed to fetch links (${res.status})`);
      const data = await res.json();
      setLinks(data);
    } catch (err) {
      console.error(err);
      setMessage("Failed to load links");
      setMessageType("error");
    } finally {
      setLoaded(true);
    }
  }

  useEffect(() => {
    fetchLinks();
  }, []);

  function validateCodeInput(v) {
    if (!v) return true; // optional
    return CODE_RE.test(v);
  }

  useEffect(() => {
    setCodeError(!validateCodeInput(customCode.trim()));
  }, [customCode]);

  async function handleAdd(e) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setMessageType("info");

    const body = {
      target_url: targetUrl.trim(),
      code: customCode.trim() || undefined,
    };

    try {
      const res = await fetch("/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const json = await res.json().catch(() => ({}));

      if (res.status === 201) {
        setMessage("✨ Link created successfully!");
        setMessageType("success");
        setTargetUrl("");
        setCustomCode("");
        fetchLinks();
      } else if (res.status === 409) {
        setMessage(json.error || "❌ Custom code already exists");
        setMessageType("error");
      } else if (res.status === 400) {
        // show server validation message
        setMessage(json.error || "❌ Invalid input");
        setMessageType("error");
      } else {
        setMessage(json.error || `❌ Failed to create link (${res.status})`);
        setMessageType("error");
      }
    } catch (err) {
      console.error(err);
      setMessage("❌ Network or server error");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  }

  // derived / helpers
  const numericTotalClicks = links.reduce(
    (t, l) => t + Number(l.total_clicks || 0),
    0
  );

  const topLinkCode =
    links.length > 0
      ? links.reduce((a, b) =>
          Number(a.total_clicks || 0) > Number(b.total_clicks || 0) ? a : b
        ).code
      : "—";

  const filteredLinks = links.filter((l) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      (l.code || "").toLowerCase().includes(q) ||
      (l.target_url || "").toLowerCase().includes(q)
    );
  });

  async function handleDelete(code) {
    if (!confirm(`Delete link ${code}?`)) return;
    try {
      const res = await fetch(`/api/links/${code}`, { method: "DELETE" });
      if (res.ok) {
        setMessage("Link deleted");
        setMessageType("success");
        fetchLinks();
      } else {
        setMessage("Failed to delete link");
        setMessageType("error");
      }
    } catch (err) {
      console.error(err);
      setMessage("Failed to delete link");
      setMessageType("error");
    }
  }

  function copyShortUrl(code) {
    const url = `${window.location.origin}/${code}`;
    navigator.clipboard
      .writeText(url)
      .then(() => {
        setMessage("Short URL copied to clipboard");
        setMessageType("success");
        setTimeout(() => setMessage(""), 2000);
      })
      .catch(() => {
        setMessage("Failed to copy URL");
        setMessageType("error");
      });
  }

  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-500 mt-1">Manage and track your short links</p>
      </div>

      {/* Stats Cards */}
      {!loaded ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 animate-pulse">
          <div className="h-24 bg-gray-300 rounded-lg"></div>
          <div className="h-24 bg-gray-300 rounded-lg"></div>
          <div className="h-24 bg-gray-300 rounded-lg"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white shadow rounded-lg p-6">
            <p className="text-gray-500">Total Links</p>
            <p className="text-3xl font-bold mt-1">{links.length}</p>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <p className="text-gray-500">Total Clicks</p>
            <p className="text-3xl font-bold mt-1">{numericTotalClicks}</p>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <p className="text-gray-500">Top Link</p>
            <p className="text-xl font-semibold mt-1">{topLinkCode}</p>
          </div>
        </div>
      )}

      {/* Create Link */}
      <div className="bg-white shadow-lg rounded-xl p-6">
        <h2 className="text-2xl font-bold mb-4">Create Short Link</h2>

        <form className="grid gap-4" onSubmit={handleAdd}>
          <div>
            <label className="font-semibold block mb-1">Target URL</label>
            <input
              className="w-full p-3 border rounded-lg focus:ring focus:ring-blue-300"
              placeholder="https://example.com"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="font-semibold block mb-1">
              Custom Code (optional)
            </label>
            <input
              className="w-full p-3 border rounded-lg focus:ring focus:ring-blue-300"
              placeholder="6-8 chars, letters & numbers (optional)"
              value={customCode}
              onChange={(e) => setCustomCode(e.target.value)}
            />
            {codeError && (
              <p className="text-sm text-red-600 mt-1">
                Code must be 6–8 alphanumeric characters (A–Z, a–z, 0–9).
              </p>
            )}
          </div>

          <button
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold transition disabled:opacity-50"
            disabled={loading || !targetUrl.trim() || !!codeError}
          >
            {loading ? "Creating..." : "Create Link"}
          </button>
        </form>

        {message && (
          <p
            className={`mt-3 ${
              messageType === "error"
                ? "text-red-600"
                : messageType === "success"
                ? "text-green-600"
                : "text-blue-600"
            }`}
          >
            {message}
          </p>
        )}
      </div>

      {/* Search */}
      <div className="flex items-center gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by code or target URL"
          className="p-3 border rounded-lg flex-1"
        />
        <button
          onClick={() => {
            setSearch("");
          }}
          className="px-3 py-2 bg-gray-100 rounded-lg"
        >
          Clear
        </button>
      </div>

      {/* Links Table */}
      <div className="bg-white shadow-lg rounded-xl p-6">
        <h2 className="text-xl font-bold mb-4">Your Links</h2>

        {!loaded ? (
          <div className="h-20 bg-gray-300 rounded-lg animate-pulse"></div>
        ) : filteredLinks.length === 0 ? (
          <p className="text-gray-500">No links match your search.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 text-left">Code</th>
                  <th className="p-3 text-left">Target</th>
                  <th className="p-3 text-center">Clicks</th>
                  <th className="p-3 text-center">Last Clicked</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLinks.map((link) => (
                  <tr key={link.code} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-semibold">{link.code}</td>
                    <td className="p-3 max-w-[400px] truncate">
                      <a
                        href={link.target_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {link.target_url}
                      </a>
                    </td>
                    <td className="p-3 text-center">
                      {Number(link.total_clicks || 0)}
                    </td>
                    <td className="p-3 text-center">
                      {link.last_clicked
                        ? new Date(link.last_clicked).toLocaleString()
                        : "—"}
                    </td>
                    <td className="p-3 text-center space-x-3">
                      <a
                        href={`/code/${link.code}`}
                        className="text-blue-600 font-semibold hover:underline"
                      >
                        View
                      </a>

                      <button
                        onClick={() => copyShortUrl(link.code)}
                        className="text-gray-700 hover:underline"
                        title="Copy short URL"
                      >
                        Copy
                      </button>

                      <button
                        onClick={() => handleDelete(link.code)}
                        className="text-red-600 font-semibold hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
