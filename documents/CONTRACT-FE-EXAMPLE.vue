<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';

// ==================== INTERFACES ====================
interface ContractMetadata {
  effectiveDate: string | null;
  expiryDate: string | null;
  totalValue: number | null;
  currency: "VND" | "USD" | "EUR" | "JPY" | null;
  summary: string | null;
  project: string | null;
  department: string | null;
  priority: "HIGH" | "MEDIUM" | "LOW" | null;
  confidentiality: "CONFIDENTIAL" | "INTERNAL" | "PUBLIC" | "RESTRICTED" | null;
  parties: ContractParty[];
  payment: PaymentInfo;
  clauses: ClausesInfo;
  reminders: Reminder[];
  risk: RiskAssessment;
  compliance: ComplianceInfo;
  keyTerms: KeyTerm[];
}

interface ContractParty {
  id: string | null;
  name: string | null;
  type: "CLIENT" | "VENDOR" | "PARTNER" | "GUARANTOR" | null;
  role: string | null;
  contact: {
    email: string | null;
    phone: string | null;
    address: string | null;
  };
  representative: {
    name: string | null;
    position: string | null;
    email: string | null;
  };
  taxCode: string | null;
}

interface PaymentInfo {
  totalValue: number | null;
  currency: "VND" | "USD" | "EUR" | "JPY" | null;
  method: string | null;
  schedule: PaymentScheduleItem[];
}

interface PaymentScheduleItem {
  milestone: string | null;
  percentage: number | null;
  amount: number | null;
  dueDate: string | null;
  status: "PENDING" | "PAID" | "OVERDUE" | "CANCELLED" | null;
}

interface ClausesInfo {
  key: Clause[];
  favorable: Clause[];
  unfavorable: Clause[];
  all: Clause[];
}

interface Clause {
  name: string | null;
  description: string | null;
  content: string | null;
  importance: "HIGH" | "MEDIUM" | "LOW" | null;
  risk?: "HIGH" | "MEDIUM" | "LOW" | null;
  advice: string | null;
  pageNumber: number | null;
}

interface Reminder {
  id: string | null;
  type: string | null;
  title: string | null;
  description: string | null;
  dueDate: string | null;
  status: "PENDING" | "COMPLETED" | "OVERDUE" | "CANCELLED" | null;
  priority: "HIGH" | "MEDIUM" | "LOW" | null;
}

interface RiskAssessment {
  level: "LOW" | "MEDIUM" | "HIGH" | null;
  factors: RiskFactor[];
  assessment: string | null;
  recommendations: string | null;
}

interface RiskFactor {
  category: string | null;
  description: string | null;
  severity: "HIGH" | "MEDIUM" | "LOW" | null;
  probability: "HIGH" | "MEDIUM" | "LOW" | null;
  impact: string | null;
  mitigation: string | null;
}

interface ComplianceInfo {
  status: "COMPLIANT" | "NON_COMPLIANT" | "PENDING_REVIEW" | "IN_AUDIT" | null;
  regulations: any[];
  certifications: any[];
}

interface KeyTerm {
  term: string | null;
  definition: string | null;
  category: "TECHNICAL" | "LEGAL" | "FINANCIAL" | "OPERATIONAL" | null;
  frequency: number | null;
  context: string | null;
}

// ==================== STATE ====================
const route = useRoute();
const fileId = route.params.fileId as string;
const contract = ref<ContractMetadata | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);
const activeTab = ref<'all' | 'key' | 'favorable' | 'unfavorable'>('all');

// ==================== FUNCTIONS ====================
const fetchContractData = async () => {
  try {
    loading.value = true;
    const response = await fetch(`/api/files/${fileId}`);
    if (!response.ok) throw new Error('Failed to fetch contract');
    const data = await response.json();
    contract.value = data.contract;
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unknown error';
  } finally {
    loading.value = false;
  }
};

const formatCurrency = (value: number | null, currency: string | null): string => {
  if (!value) return 'N/A';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: currency || 'VND'
  }).format(value);
};

const formatDate = (dateStr: string | null): string => {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const getRiskColor = (level: string | null): string => {
  switch (level) {
    case 'HIGH': return 'bg-red-100 text-red-800';
    case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
    case 'LOW': return 'bg-green-100 text-green-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getPriorityColor = (priority: string | null): string => {
  switch (priority) {
    case 'HIGH': return 'bg-red-500 text-white';
    case 'MEDIUM': return 'bg-yellow-500 text-white';
    case 'LOW': return 'bg-green-500 text-white';
    default: return 'bg-gray-500 text-white';
  }
};

const getStatusColor = (status: string | null): string => {
  switch (status) {
    case 'PAID': return 'bg-green-100 text-green-800';
    case 'PENDING': return 'bg-blue-100 text-blue-800';
    case 'OVERDUE': return 'bg-red-100 text-red-800';
    case 'CANCELLED': return 'bg-gray-100 text-gray-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

onMounted(() => {
  fetchContractData();
});
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Loading -->
    <div v-if="loading" class="text-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
      <p class="mt-4 text-gray-600">Đang tải thông tin hợp đồng...</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-6">
      <p class="text-red-800">❌ {{ error }}</p>
    </div>

    <!-- Contract Display -->
    <div v-else-if="contract" class="space-y-8">
      
      <!-- ==================== OVERVIEW CARD ==================== -->
      <div class="bg-white rounded-lg shadow-lg p-6">
        <h1 class="text-3xl font-bold text-gray-900 mb-4">📄 {{ contract.summary }}</h1>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <p class="text-sm text-gray-500">Ngày hiệu lực</p>
            <p class="text-lg font-semibold">{{ formatDate(contract.effectiveDate) }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500">Ngày hết hạn</p>
            <p class="text-lg font-semibold">{{ formatDate(contract.expiryDate) }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500">Giá trị hợp đồng</p>
            <p class="text-2xl font-bold text-blue-600">
              {{ formatCurrency(contract.totalValue, contract.currency) }}
            </p>
          </div>
        </div>

        <div class="flex flex-wrap gap-2">
          <span v-if="contract.priority" :class="getPriorityColor(contract.priority)" 
                class="px-3 py-1 rounded-full text-sm font-medium">
            {{ contract.priority }}
          </span>
          <span v-if="contract.confidentiality" 
                class="px-3 py-1 rounded-full text-sm font-medium bg-purple-500 text-white">
            🔒 {{ contract.confidentiality }}
          </span>
          <span v-if="contract.project" 
                class="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
            📁 {{ contract.project }}
          </span>
          <span v-if="contract.department" 
                class="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
            🏢 {{ contract.department }}
          </span>
        </div>
      </div>

      <!-- ==================== PARTIES ==================== -->
      <div class="bg-white rounded-lg shadow-lg p-6">
        <h2 class="text-2xl font-bold text-gray-900 mb-6">👥 Các bên tham gia</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div v-for="party in contract.parties" :key="party.id" 
               class="border border-gray-200 rounded-lg p-4">
            <h3 class="text-xl font-bold text-gray-900 mb-2">{{ party.name }}</h3>
            <p class="text-sm text-gray-600 mb-4">{{ party.role }}</p>
            
            <div class="space-y-2 text-sm">
              <p v-if="party.contact.email">
                <span class="font-medium">📧 Email:</span> {{ party.contact.email }}
              </p>
              <p v-if="party.contact.phone">
                <span class="font-medium">📞 Phone:</span> {{ party.contact.phone }}
              </p>
              <p v-if="party.contact.address">
                <span class="font-medium">📍 Address:</span> {{ party.contact.address }}
              </p>
              <p v-if="party.taxCode">
                <span class="font-medium">🏛️ Tax Code:</span> {{ party.taxCode }}
              </p>
            </div>

            <div v-if="party.representative.name" class="mt-4 pt-4 border-t border-gray-200">
              <p class="font-medium text-sm text-gray-700">Người đại diện:</p>
              <p class="text-sm">👤 {{ party.representative.name }}</p>
              <p v-if="party.representative.position" class="text-sm">
                💼 {{ party.representative.position }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- ==================== PAYMENT ==================== -->
      <div class="bg-white rounded-lg shadow-lg p-6">
        <h2 class="text-2xl font-bold text-gray-900 mb-6">💰 Thanh toán</h2>
        
        <div class="mb-6">
          <p class="text-sm text-gray-500">Tổng giá trị</p>
          <p class="text-3xl font-bold text-blue-600">
            {{ formatCurrency(contract.payment.totalValue, contract.payment.currency) }}
          </p>
          <p v-if="contract.payment.method" class="text-sm text-gray-600 mt-2">
            Phương thức: {{ contract.payment.method }}
          </p>
        </div>

        <div v-if="contract.payment.schedule.length > 0" class="space-y-4">
          <h3 class="text-lg font-semibold text-gray-900">Lịch trình thanh toán</h3>
          <div v-for="(item, idx) in contract.payment.schedule" :key="idx" 
               class="border-l-4 border-blue-500 pl-4 py-2">
            <div class="flex justify-between items-start mb-2">
              <div>
                <p class="font-semibold text-gray-900">{{ item.milestone }}</p>
                <p class="text-sm text-gray-600">{{ formatDate(item.dueDate) }}</p>
              </div>
              <span :class="getStatusColor(item.status)" 
                    class="px-3 py-1 rounded-full text-xs font-medium">
                {{ item.status }}
              </span>
            </div>
            <div class="flex gap-4 text-sm">
              <span class="font-medium">{{ item.percentage }}%</span>
              <span class="text-blue-600 font-semibold">
                {{ formatCurrency(item.amount, contract.payment.currency) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- ==================== CLAUSES ==================== -->
      <div class="bg-white rounded-lg shadow-lg p-6">
        <h2 class="text-2xl font-bold text-gray-900 mb-6">📋 Điều khoản</h2>
        
        <!-- Tabs -->
        <div class="flex gap-2 mb-6 border-b border-gray-200">
          <button @click="activeTab = 'all'" 
                  :class="activeTab === 'all' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'"
                  class="px-4 py-2 font-medium transition-colors">
            Tất cả ({{ contract.clauses.all.length }})
          </button>
          <button @click="activeTab = 'key'" 
                  :class="activeTab === 'key' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'"
                  class="px-4 py-2 font-medium transition-colors">
            ⚠️ Quan trọng ({{ contract.clauses.key.length }})
          </button>
          <button @click="activeTab = 'favorable'" 
                  :class="activeTab === 'favorable' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'"
                  class="px-4 py-2 font-medium transition-colors">
            ✅ Thuận lợi ({{ contract.clauses.favorable.length }})
          </button>
          <button @click="activeTab = 'unfavorable'" 
                  :class="activeTab === 'unfavorable' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'"
                  class="px-4 py-2 font-medium transition-colors">
            ❌ Bất lợi ({{ contract.clauses.unfavorable.length }})
          </button>
        </div>

        <!-- Clause List -->
        <div class="space-y-4">
          <div v-for="(clause, idx) in contract.clauses[activeTab]" :key="idx" 
               class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div class="flex justify-between items-start mb-2">
              <h3 class="font-semibold text-gray-900">{{ clause.name }}</h3>
              <div class="flex gap-2">
                <span v-if="clause.importance" :class="getRiskColor(clause.importance)" 
                      class="px-2 py-1 rounded text-xs font-medium">
                  {{ clause.importance }}
                </span>
                <span v-if="clause.risk" :class="getRiskColor(clause.risk)" 
                      class="px-2 py-1 rounded text-xs font-medium">
                  Risk: {{ clause.risk }}
                </span>
              </div>
            </div>
            
            <p class="text-sm text-gray-700 mb-3">{{ clause.description }}</p>
            
            <div v-if="clause.content" class="bg-gray-50 border-l-4 border-blue-500 p-3 mb-3">
              <p class="text-sm text-gray-800 italic">"{{ clause.content }}"</p>
              <p v-if="clause.pageNumber" class="text-xs text-gray-500 mt-2">
                📄 Trang {{ clause.pageNumber }}
              </p>
            </div>

            <div v-if="clause.advice" class="bg-blue-50 rounded p-3">
              <p class="text-sm text-blue-900">💡 <strong>Lời khuyên:</strong> {{ clause.advice }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- ==================== RISK ASSESSMENT ==================== -->
      <div class="bg-white rounded-lg shadow-lg p-6">
        <h2 class="text-2xl font-bold text-gray-900 mb-6">⚠️ Đánh giá rủi ro</h2>
        
        <div class="mb-6">
          <span :class="getRiskColor(contract.risk.level)" 
                class="px-4 py-2 rounded-lg text-lg font-bold">
            {{ contract.risk.level }} RISK
          </span>
        </div>

        <div v-if="contract.risk.factors.length > 0" class="space-y-4 mb-6">
          <div v-for="(factor, idx) in contract.risk.factors" :key="idx" 
               class="border border-gray-200 rounded-lg p-4">
            <div class="flex justify-between items-start mb-2">
              <h3 class="font-semibold text-gray-900">{{ factor.category }}</h3>
              <div class="flex gap-2">
                <span :class="getRiskColor(factor.severity)" 
                      class="px-2 py-1 rounded text-xs font-medium">
                  Severity: {{ factor.severity }}
                </span>
                <span :class="getRiskColor(factor.probability)" 
                      class="px-2 py-1 rounded text-xs font-medium">
                  Probability: {{ factor.probability }}
                </span>
              </div>
            </div>
            <p class="text-sm text-gray-700 mb-2">{{ factor.description }}</p>
            <p v-if="factor.impact" class="text-sm text-gray-600 mb-2">
              <strong>Impact:</strong> {{ factor.impact }}
            </p>
            <div v-if="factor.mitigation" class="bg-green-50 rounded p-3">
              <p class="text-sm text-green-900">🛡️ <strong>Mitigation:</strong> {{ factor.mitigation }}</p>
            </div>
          </div>
        </div>

        <div v-if="contract.risk.recommendations" class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p class="text-sm text-yellow-900">📌 {{ contract.risk.recommendations }}</p>
        </div>
      </div>

      <!-- ==================== REMINDERS ==================== -->
      <div v-if="contract.reminders.length > 0" class="bg-white rounded-lg shadow-lg p-6">
        <h2 class="text-2xl font-bold text-gray-900 mb-6">⏰ Nhắc nhở</h2>
        
        <div class="space-y-4">
          <div v-for="reminder in contract.reminders" :key="reminder.id" 
               class="border-l-4 border-blue-500 pl-4 py-3">
            <div class="flex justify-between items-start mb-2">
              <div>
                <h3 class="font-semibold text-gray-900">{{ reminder.title }}</h3>
                <p class="text-sm text-gray-600">{{ reminder.type }}</p>
              </div>
              <div class="flex gap-2">
                <span :class="getPriorityColor(reminder.priority)" 
                      class="px-2 py-1 rounded text-xs font-medium">
                  {{ reminder.priority }}
                </span>
                <span :class="getStatusColor(reminder.status)" 
                      class="px-2 py-1 rounded text-xs font-medium">
                  {{ reminder.status }}
                </span>
              </div>
            </div>
            <p class="text-sm text-gray-700 mb-2">{{ reminder.description }}</p>
            <p class="text-sm text-gray-600">📅 {{ formatDate(reminder.dueDate) }}</p>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
/* Add any custom styles here */
</style>
