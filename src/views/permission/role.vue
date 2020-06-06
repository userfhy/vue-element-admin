<template>
  <div class="app-container">
    <el-button type="primary" @click="handleAddRole">创建角色</el-button>

    <el-table :data="list" style="width: 100%;margin-top:30px;" border>
      <el-table-column align="center" label="Id" width="50">
        <template slot-scope="scope">
          {{ scope.row.role_id }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="角色 Key" width="220">
        <template slot-scope="scope">
          {{ scope.row.role_key }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="角色名称" width="220">
        <template slot-scope="scope">
          {{ scope.row.role_name }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="管理员" width="70">
        <template slot-scope="scope">
          {{ scope.row.is_admin ? '是':'否' }}
        </template>
      </el-table-column>
      <el-table-column align="header-center" label="描述">
        <template slot-scope="scope">
          {{ scope.row.remark }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="修改时间" width="160">
        <template slot-scope="scope">
          {{ scope.row.updated_at }}
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
      <el-form ref="role" :model="role" label-width="80px" :rules="rules" label-position="left">
        <el-form-item label="角色 Key" prop="role_key">
          <el-input v-model="role.role_key" placeholder="角色 Key" :disabled="dialogType==='edit'? true:false" />
        </el-form-item>
        <el-form-item label="角色名称" prop="role_name">
          <el-input v-model="role.role_name" placeholder="角色名称" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="role.remark"
            :autosize="{ minRows: 2, maxRows: 4}"
            type="textarea"
            placeholder="角色的描述信息"
          />
        </el-form-item>
      </el-form>
      <div style="text-align:right;">
        <el-button type="danger" @click="dialogVisible=false">取消</el-button>
        <el-button type="primary" @click="confirmRole('role')">确认</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { deepClone } from '@/utils'
import { getRoles, addRole, deleteRole, updateRole } from '@/api/role'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination

const defaultRole = {
  role_key: '',
  role_name: '',
  remark: ''
}

export default {
  components: { Pagination },
  data() {
    return {
      role: Object.assign({}, defaultRole),
      rolesList: [],
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
      rules: {
        role_key: [
          { required: true, message: '请输入角色 Key', trigger: 'blur' },
          { min: 4, max: 20, message: '长度在 4 到 20 个字符', trigger: 'blur' }
        ],
        role_name: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          { min: 4, max: 20, message: '长度在 4 到 20 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
  },
  created() {
    this.getList()
  },
  methods: {
    async getRoles() {
      const res = await getRoles()
      this.rolesList = res.data
    },
    getList() {
      this.listLoading = true
      getRoles(this.listQuery).then(response => {
        this.list = response.data.list
        this.total = response.data.total

        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 1000)
      })
    },
    handleFilter() {
      this.listQuery.p = 1
      this.getList()
    },
    handleAddRole() {
      this.role = Object.assign({}, defaultRole)
      this.dialogType = 'new'
      this.dialogVisible = true
    },
    handleEdit(scope) {
      this.dialogType = 'edit'
      this.dialogVisible = true
      this.checkStrictly = true
      this.role = deepClone(scope.row)
      this.$nextTick(() => {
        this.checkStrictly = false
      })
    },
    handleDelete({ $index, row }) {
      this.$confirm('是否确认删除该角色？', '警告', {
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
    async confirmRole(formName) {
      this.$refs[formName].validate((valid) => {
        if (!valid) {
          return false
        }
        const isEdit = this.dialogType === 'edit'
        const { remark, role_key, role_name } = this.role

        if (isEdit) {
          updateRole(this.role.role_id, this.role).then(res => {
            this.$notify({
              title: '角色信息修改成功',
              dangerouslyUseHTMLString: true,
              message: `
                    <div>角色 Key: ${role_key}</div>
                    <div>角色名称: ${role_name}</div>
                    <div>描述: ${remark}</div>
                `,
              type: 'success'
            })
          })
        } else {
          addRole(this.role).then(res => {
            this.$message({
              type: 'success',
              message: '添加成功'
            })
          })
        }

        this.dialogVisible = false
        this.getList()
      })
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
