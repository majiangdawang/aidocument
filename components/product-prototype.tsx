"use client"

import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

export function ProductPrototype({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex flex-col h-full border-l bg-white">
      <div className="flex items-center justify-between p-2 border-b">
        <div className="flex items-center">
          <span className="ml-2 text-sm font-medium flex items-center">
            <svg
              className="h-5 w-5 text-blue-500 mr-1"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
              <path d="M3 9H21" stroke="currentColor" strokeWidth="2" />
              <path d="M9 21L9 9" stroke="currentColor" strokeWidth="2" />
            </svg>
            产品可交互原型
          </span>
        </div>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {/* Direct UI Mockup */}
        <div className="border rounded-md shadow-sm">
          {/* Header */}
          <div className="bg-gray-100 p-3 border-b">
            <div className="flex items-center justify-between">
              <div className="text-lg font-medium">药品字典管理系统</div>
              <div className="flex items-center gap-3">
                <span className="text-sm">张医生</span>
                <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white">张</div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex h-[500px]">
            {/* Left Sidebar */}
            <div className="w-48 border-r p-3">
              <div className="mb-4">
                <div className="text-sm font-medium mb-2">药品管理</div>
                <div className="pl-2 space-y-1">
                  <div className="text-sm py-1 text-blue-600 bg-blue-50 px-2 rounded">药品字典</div>
                  <div className="text-sm py-1 px-2">商品管理</div>
                  <div className="text-sm py-1 px-2">价格配置</div>
                </div>
              </div>
              <div>
                <div className="text-sm font-medium mb-2">系统设置</div>
                <div className="pl-2 space-y-1">
                  <div className="text-sm py-1 px-2">用户管理</div>
                  <div className="text-sm py-1 px-2">权限配置</div>
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 p-4">
              <div className="mb-4">
                <h2 className="text-lg font-medium mb-3">药品字典</h2>
                <div className="flex gap-3 mb-4">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="搜索药品名称、编码"
                      className="w-full p-2 border rounded-md text-sm"
                    />
                  </div>
                  <Button size="sm">查询</Button>
                  <Button size="sm" variant="outline">
                    重置
                  </Button>
                  <Button size="sm" variant="outline">
                    高级筛选
                  </Button>
                </div>

                {/* Tabs */}
                <div className="flex border-b mb-4">
                  <div className="px-4 py-2 border-b-2 border-blue-500 text-blue-600 font-medium">药品信息</div>
                  <div className="px-4 py-2 text-gray-500">商品信息</div>
                  <div className="px-4 py-2 text-gray-500">价格信息</div>
                </div>

                {/* Table */}
                <div className="border rounded-md">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="p-2 text-left font-medium">药品编码</th>
                        <th className="p-2 text-left font-medium">通用名称</th>
                        <th className="p-2 text-left font-medium">药理分类</th>
                        <th className="p-2 text-left font-medium">剂型</th>
                        <th className="p-2 text-left font-medium">状态</th>
                        <th className="p-2 text-left font-medium">操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-t">
                        <td className="p-2">YP001</td>
                        <td className="p-2">阿莫西林</td>
                        <td className="p-2">抗生素</td>
                        <td className="p-2">胶囊</td>
                        <td className="p-2">
                          <span className="text-green-500">启用</span>
                        </td>
                        <td className="p-2">
                          <div className="flex gap-2">
                            <Button size="sm" variant="ghost" className="h-7 px-2">
                              编辑
                            </Button>
                            <Button size="sm" variant="ghost" className="h-7 px-2">
                              查看
                            </Button>
                          </div>
                        </td>
                      </tr>
                      <tr className="border-t">
                        <td className="p-2">YP002</td>
                        <td className="p-2">布洛芬</td>
                        <td className="p-2">解热镇痛药</td>
                        <td className="p-2">片���</td>
                        <td className="p-2">
                          <span className="text-green-500">启用</span>
                        </td>
                        <td className="p-2">
                          <div className="flex gap-2">
                            <Button size="sm" variant="ghost" className="h-7 px-2">
                              编辑
                            </Button>
                            <Button size="sm" variant="ghost" className="h-7 px-2">
                              查看
                            </Button>
                          </div>
                        </td>
                      </tr>
                      <tr className="border-t">
                        <td className="p-2">YP003</td>
                        <td className="p-2">氯雷他定</td>
                        <td className="p-2">抗过敏药</td>
                        <td className="p-2">片剂</td>
                        <td className="p-2">
                          <span className="text-green-500">启用</span>
                        </td>
                        <td className="p-2">
                          <div className="flex gap-2">
                            <Button size="sm" variant="ghost" className="h-7 px-2">
                              编辑
                            </Button>
                            <Button size="sm" variant="ghost" className="h-7 px-2">
                              查看
                            </Button>
                          </div>
                        </td>
                      </tr>
                      <tr className="border-t">
                        <td className="p-2">YP004</td>
                        <td className="p-2">甲硝唑</td>
                        <td className="p-2">抗菌药</td>
                        <td className="p-2">片剂</td>
                        <td className="p-2">
                          <span className="text-green-500">启用</span>
                        </td>
                        <td className="p-2">
                          <div className="flex gap-2">
                            <Button size="sm" variant="ghost" className="h-7 px-2">
                              编辑
                            </Button>
                            <Button size="sm" variant="ghost" className="h-7 px-2">
                              查看
                            </Button>
                          </div>
                        </td>
                      </tr>
                      <tr className="border-t">
                        <td className="p-2">YP005</td>
                        <td className="p-2">辛伐他汀</td>
                        <td className="p-2">调血脂药</td>
                        <td className="p-2">片剂</td>
                        <td className="p-2">
                          <span className="text-red-500">停用</span>
                        </td>
                        <td className="p-2">
                          <div className="flex gap-2">
                            <Button size="sm" variant="ghost" className="h-7 px-2">
                              编辑
                            </Button>
                            <Button size="sm" variant="ghost" className="h-7 px-2">
                              查看
                            </Button>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <div className="p-2 flex items-center justify-between bg-gray-50">
                    <div className="text-sm text-gray-500">共 24 条记录</div>
                    <div className="flex items-center gap-1">
                      <Button size="sm" variant="outline" className="h-7 px-2">
                        上一页
                      </Button>
                      <Button size="sm" variant="subtle" className="h-7 w-7 p-0">
                        1
                      </Button>
                      <Button size="sm" variant="outline" className="h-7 w-7 p-0">
                        2
                      </Button>
                      <Button size="sm" variant="outline" className="h-7 w-7 p-0">
                        3
                      </Button>
                      <Button size="sm" variant="outline" className="h-7 px-2">
                        下一页
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
