"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Database,
  TableIcon,
  Search,
  RefreshCw,
  Download,
  Eye,
  Users,
  ShoppingCart,
  MessageCircle,
  Puzzle,
} from "lucide-react"
import { toast } from "sonner"

interface TableInfo {
  table_name: string
  row_count: number
  size: string
}

interface TableData {
  columns: string[]
  rows: any[]
  total_count: number
}

export default function DatabaseViewerPage() {
  const [tables, setTables] = useState<TableInfo[]>([])
  const [selectedTable, setSelectedTable] = useState<string>("")
  const [tableData, setTableData] = useState<TableData | null>(null)
  const [loading, setLoading] = useState(true)
  const [dataLoading, setDataLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(50)

  useEffect(() => {
    fetchTables()
  }, [])

  useEffect(() => {
    if (selectedTable) {
      fetchTableData(selectedTable, currentPage)
    }
  }, [selectedTable, currentPage])

  const fetchTables = async () => {
    try {
      const response = await fetch("/api/admin/database/tables")
      if (response.ok) {
        const data = await response.json()
        setTables(data)
        if (data.length > 0 && !selectedTable) {
          setSelectedTable(data[0].table_name)
        }
      }
    } catch (error) {
      console.error("Error fetching tables:", error)
      toast.error("Gagal memuat tabel database")
    } finally {
      setLoading(false)
    }
  }

  const fetchTableData = async (tableName: string, page = 1) => {
    setDataLoading(true)
    try {
      const response = await fetch(
        `/api/admin/database/tables/${tableName}?page=${page}&limit=${pageSize}&search=${searchTerm}`,
      )
      if (response.ok) {
        const data = await response.json()
        setTableData(data)
      }
    } catch (error) {
      console.error("Error fetching table data:", error)
      toast.error("Gagal memuat data tabel")
    } finally {
      setDataLoading(false)
    }
  }

  const exportTableData = async (tableName: string) => {
    try {
      const response = await fetch(`/api/admin/database/export/${tableName}`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `${tableName}_export.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        toast.success("Data berhasil diexport")
      }
    } catch (error) {
      console.error("Error exporting data:", error)
      toast.error("Gagal export data")
    }
  }

  const getTableIcon = (tableName: string) => {
    if (tableName.includes("user") || tableName.includes("profile")) return Users
    if (tableName.includes("order")) return ShoppingCart
    if (tableName.includes("chat")) return MessageCircle
    if (tableName.includes("plugin")) return Puzzle
    return TableIcon
  }

  const formatValue = (value: any) => {
    if (value === null) return <span className="text-gray-400 italic">null</span>
    if (typeof value === "boolean") return value ? "true" : "false"
    if (typeof value === "object") return JSON.stringify(value)
    if (typeof value === "string" && value.length > 100) {
      return (
        <span title={value} className="cursor-help">
          {value.substring(0, 100)}...
        </span>
      )
    }
    return String(value)
  }

  const totalPages = tableData ? Math.ceil(tableData.total_count / pageSize) : 0

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat database...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Database Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Tables</p>
                <p className="text-2xl font-bold text-gray-900">{tables.length}</p>
              </div>
              <Database className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Records</p>
                <p className="text-2xl font-bold text-gray-900">
                  {tables.reduce((sum, table) => sum + table.row_count, 0).toLocaleString()}
                </p>
              </div>
              <TableIcon className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Selected Table</p>
                <p className="text-lg font-bold text-gray-900">{selectedTable || "None"}</p>
              </div>
              <Eye className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Current Records</p>
                <p className="text-2xl font-bold text-gray-900">{tableData?.total_count || 0}</p>
              </div>
              <RefreshCw className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="tables" className="space-y-6">
        <TabsList>
          <TabsTrigger value="tables">Tables Overview</TabsTrigger>
          <TabsTrigger value="data">Table Data</TabsTrigger>
        </TabsList>

        <TabsContent value="tables" className="space-y-6">
          {/* Tables List */}
          <Card>
            <CardHeader>
              <CardTitle>Database Tables</CardTitle>
              <CardDescription>Overview semua tabel dalam database</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tables.map((table) => {
                  const IconComponent = getTableIcon(table.table_name)
                  return (
                    <Card
                      key={table.table_name}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedTable === table.table_name ? "ring-2 ring-blue-500" : ""
                      }`}
                      onClick={() => setSelectedTable(table.table_name)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <IconComponent className="w-6 h-6 text-blue-600" />
                          <Badge variant="outline">{table.row_count} rows</Badge>
                        </div>
                        <h3 className="font-medium text-gray-900 mb-1">{table.table_name}</h3>
                        <p className="text-sm text-gray-600">Size: {table.size}</p>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data" className="space-y-6">
          {/* Table Data Viewer */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Table Data: {selectedTable}</CardTitle>
                <CardDescription>
                  {tableData ? `${tableData.total_count} total records` : "Select a table to view data"}
                </CardDescription>
              </div>
              <div className="flex space-x-2">
                <Select value={selectedTable} onValueChange={setSelectedTable}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select table" />
                  </SelectTrigger>
                  <SelectContent>
                    {tables.map((table) => (
                      <SelectItem key={table.table_name} value={table.table_name}>
                        {table.table_name} ({table.row_count})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  onClick={() => selectedTable && fetchTableData(selectedTable, currentPage)}
                  disabled={dataLoading}
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${dataLoading ? "animate-spin" : ""}`} />
                  Refresh
                </Button>
                <Button
                  variant="outline"
                  onClick={() => selectedTable && exportTableData(selectedTable)}
                  disabled={!selectedTable}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Search */}
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder="Search in table data..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && selectedTable) {
                        setCurrentPage(1)
                        fetchTableData(selectedTable, 1)
                      }
                    }}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Data Table */}
              {dataLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    <p className="text-gray-600">Loading data...</p>
                  </div>
                </div>
              ) : tableData && tableData.rows.length > 0 ? (
                <div className="space-y-4">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          {tableData.columns.map((column) => (
                            <TableHead key={column} className="min-w-32">
                              {column}
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {tableData.rows.map((row, index) => (
                          <TableRow key={index}>
                            {tableData.columns.map((column) => (
                              <TableCell key={column} className="max-w-xs">
                                {formatValue(row[column])}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600">
                        Showing {(currentPage - 1) * pageSize + 1} to{" "}
                        {Math.min(currentPage * pageSize, tableData.total_count)} of {tableData.total_count} results
                      </p>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                          disabled={currentPage === 1}
                        >
                          Previous
                        </Button>
                        <span className="flex items-center px-3 py-1 text-sm">
                          Page {currentPage} of {totalPages}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                          disabled={currentPage === totalPages}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {selectedTable ? "No data found" : "Select a table"}
                  </h3>
                  <p className="text-gray-600">
                    {selectedTable
                      ? "This table is empty or no records match your search"
                      : "Choose a table from the dropdown to view its data"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
