// 确保所有需要高亮的段落都正确使用 clarification-paragraph 类

export const documentContent = `
<h1 data-section-id="document-title" style="text-align: center">药品字典需求规格说明书</h1>

<h2 data-section-id="chapter-1">第一章 概述</h2>

<h3 data-section-id="section-1-1">1.1 编写目的</h3>
<p>本规格说明书旨在明确药品字典维护功能的需求范围、业务流程及技术实现细节，为开发、测试及验收提供依据。</p>

<h3 data-section-id="section-1-2">1.2 需求背景</h3>
<p class="clarification-paragraph">为提高药品信息管理的标准化和严谨性，需构建分层级联的药品字典，支持药品、商品、价格三层数据结构，适配多业务场景（如医药诊疗、皮试试剂）的整合需求。<span class="citation-component" data-number="1">1</span> <span class="prototype-reference" data-id="dictionary">原型</span></p>

<h3 data-section-id="section-1-3">1.3 可行性分析</h3>
<p>当前系统已具备药字典字典管理及分层数据架构设计能力，技术可行；业务上符合医疗机构药品管理规范。<span class="citation-component" data-number="1">1</span></p>

<h3 data-section-id="section-1-4">1.4 业务影响范围</h3>
<p class="clarification-paragraph">涉及药库管理、医嘱处理、定价结算等核心业务模块，需与现有系统的字典服务，价格管理模块对接。需要明确各模块的接口规范和数据交换标准，确保系统集成的顺畅性。</p>

<h3 data-section-id="section-1-5">1.5 术语定义</h3>
<ul>
  <li>药品类：基础药物信息（如通用名、药理分类）。</li>
  <li>商品类：同一药品的厂商、规格差异化信息。</li>
  <li>价格类：同一商品的定价规则（如税、差率化价格）。<span class="citation-component" data-number="1">1</span></li>
</ul>

<h2 data-section-id="chapter-2">第二章 业务领域说明</h2>

<h3 data-section-id="section-2-1">2.1 涉及业务领域概述</h3>
<p>药品字典维护核心业务领域包括：</p>
<ol>
  <li>药品信息管理：维护基础药品属性（如类型、药理分类）。</li>
  <li>商品信息扩展：支持多厂商、多规格商品配置。<span class="citation-component" data-number="1">1</span> <span class="prototype-reference" data-id="product">原型</span></li>
  <li class="clarification-paragraph">价格动态调整：管理药品不同销售单位的价格策略，包括批发价、零售价、医保价等多种价格体系，并支持按时间、区域、客户类型等维度的差异化定价。</li>
</ol>

<h3 data-section-id="section-2-2">2.2 涉及活动清单</h3>
<ul>
  <li>药品品类维护/变动维护</li>
  <li>商品属性编辑维与批量保存<span class="citation-component" data-number="1">1</span></li>
  <li class="clarification-paragraph">价格层多条件动态配置：支持按照不同维度（如时间段、客户类型、支付方式等）设置差异化价格策略，实现精细化的价格管理。<span class="prototype-reference" data-id="price">原型</span></li>
  <li>药品名称、用法用量、和属属性维护</li>
</ul>

<h2 data-section-id="chapter-3">第三章 活动说明</h2>

<h3 data-section-id="section-3-1">3.1 药品维护活动流程描述</h3>
<h4 data-section-id="section-3-1-1">3.1.1 活动业务概述</h4>
<p>通过分层架构维护药品品类，确保上下级信息息联联一致，支持多业务场景的校验规则。<span class="citation-component" data-number="1">1</span></p>

<h4 data-section-id="section-3-1-2">3.1.2 活动业务场景描述</h4>
<p class="clarification-paragraph">药品字典维护主要应用于以下场景：新药品引入、药品信息更新、药品规格变更、价格策略调整等。系统需要支持这些场景下的数据一致性检查、变更审批流程以及历史记录追溯功能，确保药品信息的准确性和可追溯性。</p>
`
