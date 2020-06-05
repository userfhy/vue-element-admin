<template>
  <div class="app-container">
    <el-button type="primary" @click="handleAddApi">创建规则</el-button>

    <el-table :data="list" style="width: 100%;margin-top:30px;" border>
      <el-table-column align="center" label="Id" width="50">
        <template slot-scope="scope">
          {{ scope.row.id }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="角色 Key" width="120">
        <template slot-scope="scope">
          {{ scope.row.v0 }}
        </template>
      </el-table-column>
      <el-table-column align="header-center" label="路由路径" width="230">
        <template slot-scope="scope">
          {{ scope.row.v1 }}
        </template>
      </el-table-column>
      <el-table-column align="header-center" label="请求类型" width="80">
        <template slot-scope="scope">
          <el-tag :type="method[scope.row.v2]" size="mini" effect="plain">{{ scope.row.v2 }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" label="创建时间" width="160">
        <template slot-scope="scope">
          {{ scope.row.created_at }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作">
        <template slot-scope="scope">
          <el-button type="primary" size="small" @click="handleEdit(scope)">编辑</el-button>
          <el-button type="danger" size="small" @click="handleDelete(scope)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.p" :limit.sync="listQuery.n" @pagination="getList" />

    <el-dialog :visible.sync="dialogVisible" :title="dialogType==='edit'?'编辑角色':'创建角色'">
      <el-form :model="api" label-width="80px" label-position="left">
        <el-form-item label="角色 Key">
          <el-input v-model="api.v0" placeholder="角色 Key" :disabled="dialogType==='edit'? true:false" />
        </el-form-item>
        <el-form-item label="路由路径">
          <el-input v-model="api.v1" placeholder="路由路径" />
        </el-form-item>
      </el-form>
      <div style="text-align:right;">
        <el-button type="danger" @click="dialogVisible=false">取消</el-button>
        <el-button type="primary" @click="confirmRole">确认</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { deepClone } from '@/utils'
import { getApiList, addRole, deleteRole, updateRole } from '@/api/api_authority'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination

const defaultAPi = {
  id: 0,
  v0: '',
  v1: '',
  v2: ''
}

export default {
  components: { Pagination },
  data() {
    return {
      api: Object.assign({}, defaultAPi),
      ApiList: [],
      dialogVisible: false,
      dialogType: 'new',
      checkStrictly: false,
      defaultProps: {
        children: 'children',
        label: 'title'
      },
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        p: 1,
        n: 10
      },
      method: {
        'GET': '',
        'POST': 'success',
        'PUT': 'warning',
        'DELETE': 'danger'
      }
    }
  },
  computed: {
  },
  created() {
    this.getList()
  },
  methods: {
    async getApi() {
      const res = await getApiList()
      this.ApiList = res.data
    },
    getList() {
      this.listLoading = true
      getApiList(this.listQuery).then(response => {
        this.list = response.data.list
        this.total = response.data.total

        setTimeout(() => {
          this.listLoading = false
        }, 2.5 * 1000)
      })
    },
    handleFilter() {
      this.listQuery.p = 1
      this.getList()
    },
    handleAddApi() {
      this.api = Object.assign({}, defaultAPi)
      this.dialogType = 'new'
      this.dialogVisible = true
    },
    handleEdit(scope) {
      this.dialogType = 'edit'
      this.dialogVisible = true
      this.checkStrictly = true
      this.api = deepClone(scope.row)
      this.$nextTick(() => {
        this.checkStrictly = false
      })
    },
    handleDelete({ $index, row }) {
      this.$confirm('是否确认删除？', '警告', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async() => {
          await deleteRole(row.role_id)
          this.$message({
            type: 'success',
            message: '删除成功'
          })
          this.getList()
        })
        .catch(err => { console.error(err) })
    },
    async confirmRole() {
      const isEdit = this.dialogType === 'edit'

      if (isEdit) {
        await updateRole(this.api.id, this.api)
      } else {
        const { data } = await addRole(this.api)
        this.api.v0 = data.role_id
      }

      const { v0, v1, v2 } = this.api
      this.dialogVisible = false
      this.$notify({
        title: '修改成功',
        dangerouslyUseHTMLString: true,
        message: `
            <div>角色 Key: ${v0}</div>
            <div>PATH: ${v1}</div>
            <div>描述: ${v2}</div>
          `,
        type: 'success'
      })
      this.getList()
    }
  }
}
</script>

<style lang="scss" scoped>
.app-container {
  .roles-table {
    margin-top: 30px;
  }
  .permission-tree {
    margin-bottom: 30px;
  }
}
</style>
