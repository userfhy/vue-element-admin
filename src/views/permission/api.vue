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

    <el-dialog :close-on-click-modal="false" :visible.sync="dialogVisible" :title="dialogType==='edit'?'编辑':'创建'">
      <el-form ref="api" :rules="rules" :model="api" label-width="80px" label-position="left">
        <el-form-item label="角色 Key" prop="v0">
          <el-select v-model="api.v0" placeholder="请选择" :disabled="dialogType==='edit'? true:false" @change="handleRoleSelectChange">
            <el-option
              v-for="item in rolesList"
              :key="item.role_id"
              :value="item.role_key"
            >
              <span style="float: left">{{ item.role_key }}</span>
              <span style="float: right; color: #8492a6; font-size: 10px">{{ item.role_name }}</span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="路由路径" prop="v1">
          <!-- <el-select v-model="api.v1" class="autocomplete-select" filterable placeholder="请选择" @change="handlePathSelect">
            <el-option
              v-for="item in sysRouterList"
              :key="item.role_id"
              :value="item.path"
            >
              <div>
                {{ item.value }}
                <el-tag class="method-tag" :type="method[item.method]" size="mini" effect="plain">{{ item.method }}</el-tag>
              </div>
            </el-option>
          </el-select> -->
          <el-autocomplete
            v-model="api.v1"
            :fetch-suggestions="querySearchAsync"
            placeholder="路由路径"
            class="autocomplete-input"
            @select="handlePathSelect"
          >
            <template slot-scope="{ item }">
              <div>
                {{ item.value }}
                <el-tag class="method-tag" :type="method[item.method]" size="mini" effect="plain">{{ item.method }}</el-tag>
              </div>
            </template>
          </el-autocomplete>
        </el-form-item>
        <el-form-item label="请求类型" prop="v2">
          <el-radio-group v-model="api.v2">
            <el-radio v-for="(v, k) in method" :key="v" :label="k">
              <el-tag :type="method[k]" size="mini" effect="plain">{{ k }}</el-tag>
            </el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <div style="text-align:right;">
        <el-button type="danger" @click="dialogVisible=false">取消</el-button>
        <el-button type="primary" @click="confirmRole('api')">确认</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { deepClone } from '@/utils'
import { getRoles } from '@/api/role'
import { getSysRouterList, getApiList, addApi, deleteApi, updateApi } from '@/api/api_authority'
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
      apiList: [],
      groupApiList: [],
      rolesList: [],
      sysRouterList: [],
      sysRouterFilterList: [],
      timeout: null,
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
        n: 10,
        group_by: ''
      },
      method: {
        'GET': '',
        'POST': 'success',
        'PUT': 'warning',
        'DELETE': 'danger'
      },
      rules: {
        v0: [
          { required: true, message: '请选择角色 Key', trigger: 'change' }
        ],
        v1: [
          { required: true, message: '请输入路由 Path', trigger: 'blur' },
          { min: 4, max: 30, message: '长度在 4 到 30 个字符', trigger: 'blur' }
        ],
        v2: [
          { required: true, message: '请选择请求 Method', trigger: 'change' }
        ]
      }
    }
  },
  computed: {
  },
  created() {
    this.getList() // 规则列表
    this.getRolesList() // 角色列表
    this.getGroupList() // 分组列表
  },
  mounted() {
    this.getRouterList() // 后端路由接口
  },
  methods: {
    async getApi() {
      const res = await getApiList()
      this.apiList = res.data
    },
    getRolesList() {
      // 角色
      getRoles({ p: 1, n: 100 }).then(response => {
        this.rolesList = response.data.list
      })
    },
    getRouterList() {
      // 后端路由接口
      getSysRouterList().then(res => {
        this.sysRouterList = res.data
        for (let i = 0, len = this.sysRouterList.length; i < len; i++) {
          this.sysRouterList[i].value = this.sysRouterList[i].path
        }
      })
    },
    getGroupList() {
      getApiList({ p: 1, n: 100, group_by: 'v0' }).then(response => {
        this.groupApiList = response.data
      })
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
          await deleteApi(row.role_id)
          this.$message({
            type: 'success',
            message: '删除成功'
          })
          this.getList()
        })
        .catch(err => { console.error(err) })
    },
    confirmRole(formName) {
      this.$refs[formName].validate((valid) => {
        if (!valid) {
          return false
        }

        const isEdit = this.dialogType === 'edit'
        if (isEdit) {
          updateApi(this.api.id, this.api).then(response => {
            this.$message({
              type: 'success',
              message: '修改成功'
            })
          })
        } else {
          addApi(this.api).then(response => {
            this.$message({
              type: 'success',
              message: '添加成功'
            })
          })
        }
        this.dialogVisible = false

        this.getList()
      })
    },
    querySearchAsync(queryString, cb) {
      var restaurants = this.sysRouterList

      var results = queryString ? restaurants.filter(this.createStateFilter(queryString)) : restaurants

      clearTimeout(this.timeout)
      this.timeout = setTimeout(() => {
        cb(results)
      }, 1000 * Math.random())
    },
    createStateFilter(queryString) {
      return (state) => {
        return (state.value.toLowerCase().indexOf(queryString.toLowerCase()) !== -1)
      }
    },
    handleRoleSelectChange(item) {
      // 过滤已存在路径
      this.sysRouterFilterList = []
      if (item in this.groupApiList.list) {
        this.groupApiList.list[item].forEach(element => {
          this.sysRouterFilterList.push({ value: element.v1, path: element.v1, method: element.v2 })
        })
      }
    },
    handlePathSelect(item) {
      // 选中 api method
      for (let index = 0; index < this.sysRouterFilterList.length; index++) {
        if (this.sysRouterFilterList[index].method === item.method && this.sysRouterFilterList[index].path === item.path) {
          this.$message({
            type: 'warning',
            message: '该角色对应的路由已经添加,不需要重复选择！'
          })
          return
        }
      }
      this.api.v2 = item.method
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

// .autocomplete-select{
//     display: flex;
// }
.autocomplete-input{
    display: flex;
    input{
        flex: 1;
        -webkit-box-flex: 1;
    }
}
 .method-tag{
        float: right;
    }
</style>
