"use client"

import { Button } from "@/components/ui/button"
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download } from "lucide-react"

export function PdfViewer({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex flex-col h-full border-l bg-white">
      <div className="flex items-center justify-between p-2 border-b">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
          <span className="ml-2 text-sm font-medium">药品字典规则明细.pdf</span>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-6 w-6">
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6">
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6">
            <Download className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="flex-1 bg-gray-100 p-4 overflow-auto">
        <div className="bg-white shadow-md mx-auto max-w-2xl min-h-[800px] p-8">
          <div className="text-right mb-8">4</div>
          <div className="space-y-4">
            <h2 className="text-center font-bold">药品字典规则明细</h2>
            <h3>1. 药品层级结构规则</h3>
            <p>药品字典采用三层级联结构，各层级定义及关系如下：</p>
            <p>
              <strong>1.1 药品层（基础层）</strong>
              ：记录药品通用名、药理分类、药品类型等基础信息，是字典的核心层级。每个药品层记录必须具有唯一标识符，且不可重复。药品层信息变更需经过严格的审批流程，以确保数据一致性。
            </p>
            <p>
              <strong>1.2 商品层（中间层）</strong>
              ：基于药品层，扩展记录不同厂商、不同规格的商品信息。一个药品可关联多个商品，但每个商品必须且只能关联一个药品。商品层需记录生产厂商、批准文号、规格、包装等信息。
            </p>
            <p>
              <strong>1.3 价格层（应用层）</strong>
              ：基于商品层，记录不同销售单位、不同应用场景下的价格策略。一个商品可设置多个价格策略，支持按时间段、客户类型、支付方式等维度设置差异化价格。
            </p>
            <h3>2. 数据完整性规则</h3>
            <p>
              <strong>2.1 必填字段规则</strong>
              ：药品层必填字段包括药品编码、通用名称、药理分类、剂型；商品层必填字段包括商品编码、规格、生产厂商；价格层必填字段包括价格编码、基础单价、计价单位。
            </p>
            <p>
              <strong>2.2 唯一性约束</strong>
              ：药品编码、商品编码、价格编码在各自层级内必须唯一；药品通用名+规格+厂商的组合在系统中必须唯一，以防止重复录入。
            </p>
            <p>
              <strong>2.3 级联删除规则</strong>
              ：删除药品层记录时，将级联删除关联的所有商品层和价格层记录；删除商品层记录时，将级联删除关联的所有价格层记录。
            </p>
            <h3>3. 业务规则</h3>
            <p>
              <strong>3.1 药品停用规则</strong>
              ：药品停用后，关联的商品默认停用，但可单独设置商品状态；商品停用后，关联的价格策略默认停用，但可单独设置价格状态。
            </p>
            <p>
              <strong>3.2 价格生效规则</strong>
              ：价格策略可设置生效时间范围，系统自动根据当前时间判断价格是否生效；当多个价格策略同时满足条件时，按优先级从高到低选择生效价格。
            </p>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center p-2 border-t">
        <Button variant="ghost" size="icon">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="mx-2 text-sm">4 / 12</span>
        <Button variant="ghost" size="icon">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
