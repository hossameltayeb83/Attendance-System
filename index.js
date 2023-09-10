const express = require('express')
const mongoose = require('mongoose')
const session = require('express-session')
const flash = require('connect-flash')
const bcrypt = require('bcrypt')
const methodOverride = require('method-override')
const Employee = require('./models/employees')
const Department = require('./models/departments')
const Request = require('./models/requests')
const Log = require('./models/logs')

mongoose.set('strictQuery', true);
mongoose.connect("mongodb://127.0.0.1:27017/attendanceSystem").then(() => {
    console.log("connection open")
}).catch(err => {
    console.log("error")
    console.log(err)
})
const app = express()
const sessionConfig = {
    secret: 'thisshouldbeabettersecret!',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24,
        maxAge: 1000 * 60 * 60 * 24
    }
}
app.use(express.static('public'))
app.use(methodOverride('_method'))
app.use(session(sessionConfig))
app.use(flash())
app.use((req, res, next) => {
    res.locals.message = req.flash('success')

    res.locals.message = req.flash('fail')
    next()
})
app.use(express.urlencoded({ extended: true }))
app.set('view engine', 'ejs')



app.get('/', (req, res) => {
    res.redirect('/login')
})

app.get('/departments', async(req, res) => {
    const departments = await Department.find()
    res.render('departments', { departments })
})
app.get('/departments/:id/edit', async(req, res) => {
    const { id } = req.params
    const department = await Department.findById(id)
    res.render('departmentsEdit', { department })
})
app.post('/departments', async(req, res) => {
    const { department, startOfDay, endOfDay } = req.body
    const newDepartment = new Department({ name: department, startOfDay: startOfDay, endOfDay: endOfDay })
    await newDepartment.save()
    res.redirect('/departments')
})
app.put('/departments/:id', async(req, res) => {
    const { id } = req.params
    const { department, startOfDay, endOfDay } = req.body
    const oldDepartment = await Department.findById(id)

    const employees = await Employee.updateMany({ department: oldDepartment.name }, { department: '' })
    const headOfDepartment = await Employee.updateOne({ department: '', isHOD: true }, { isHOD: false })

    const newDepartment = await Department.findByIdAndUpdate(
        id, {
            startOfDay: startOfDay,
            endOfDay: endOfDay,
            name: department
        }, { runValidators: true, new: true }
    )


    res.redirect('/departments')
})
app.delete('/departments/:id', async(req, res) => {
    const { id } = req.params
    const oldDepartment = await Department.findById(id)
    const employees = await Employee.updateMany({ department: oldDepartment.name }, { department: '' })
    const headOfDepartment = await Employee.updateOne({ department: '', isHOD: true }, { isHOD: false })

    await Department.findByIdAndDelete(id)

    res.redirect('/dashboard')
})

app.get('/dashboard', async(req, res) => {
    if (req.session.employeeId) {
        const employee = await Employee.findById(req.session.employeeId)
        const employees = await Employee.find({})
        if (employee.isAdmin == true) {

            res.render('admin/dashboard', { employees, employee })
        } else if (employee.isHOD == true) {
            res.render('hod/dashboard', { employee, employees })
        } else {

            res.render('dashboard', { employee })
        }
    } else {
        req.flash('fail', 'not logged in')
        res.redirect('/login')
    }
})
app.post('/mkhod/:id', async(req, res) => {
    const { id } = req.params
    await Employee.findByIdAndUpdate(id, { isHOD: true })
    req.flash('success', "employee made head of department")
    res.redirect('/dashboard')
})
app.post('/mkemp/:id', async(req, res) => {
    const { id } = req.params
    await Employee.findByIdAndUpdate(id, { isHOD: false })
    req.flash('success', "Head of Department made Employee")
    res.redirect('/dashboard')
})
app.get('/account/:id', async(req, res) => {
    const { id } = req.params
    const employee = await Employee.findById(id)

    let now = new Date()
    let month = new Date()
    let interval = month.getTime() - (30 * 24 * 60 * 60 * 1000)

    month.setTime(interval)

    const logs = await Log.find({ employee: employee, type: 'checkIn', time: { $gte: month, $lte: now } })

    res.render('employeeDetails', { employee, logs })
})
app.get('/account/:id/edit', async(req, res) => {
    const { id } = req.params
    const departments = await Department.find()
    const employee = await Employee.findById(id)
    res.render('employeeEdit', { employee, departments })
})
app.put('/account/:id', async(req, res) => {
    const { id } = req.params
    const { email, firstName, secondName, department } = req.body
    const employee = await Employee.findByIdAndUpdate(
        id, {
            email: email,
            firstName: firstName,
            secondName: secondName,
            department: department
        }, { runValidators: true, new: true })
    res.redirect('/dashboard')
})
app.get('/login', (req, res) => {
    res.render('login')
})
app.post('/login', async(req, res) => {
        const { email, password } = req.body
        const employee = await Employee.findOne({ email: email })
        if (employee) {
            const validPassword = await bcrypt.compare(password, employee.password)
            if (validPassword) {
                req.flash('success', 'succesfuly loged in')
                req.session.employeeId = employee._id
                res.redirect('/dashboard')
            } else {
                req.flash('fail', 'either email or password are incorrect')
                res.redirect('/login')
            }
        } else {
            req.flash('fail', 'either email or password are incorrect')
            res.redirect('/login')
        }

    })
    // app.post('/checkin/:id',async(req,res)=>{
    //     const {id}= req.params
    //     const employee= await Employee.findByIdAndUpdate(id,{isAvailable:true})
    //     const log = new Log({time:Date(),type:"checkIn"})
    //     log.employee= employee
    //     await log.save()
    //     console.log(employee);
    //     res.redirect('/dashboard')
    // })
app.post('/checkin/:id', async(req, res) => {
    const { id } = req.params
    const employee = await Employee.findById(id)
    const department = await Department.findOne({ name: employee.department })

    const currentTime = new Date()
    const day = currentTime.getDate()
    const year = currentTime.getFullYear()
    const month = currentTime.getMonth() + 1
    const endOfDay = new Date(`${year}-${month}-${day}T${department.endOfDay}:00`)
    const startOfDay = new Date(`${year}-${month}-${day}T${department.startOfDay}:00`)
    if (startOfDay <= currentTime && currentTime < endOfDay) {
        employee.isAvailable = true

        const log = new Log({ time: Date(), type: "checkIn" })
        log.employee = employee
        await employee.save()
        await log.save()

    } else if (startOfDay >= currentTime) {
        req.flash('fail', `Can't Check In before Working Hours ${department.startOfDay}`)
    } else {
        req.flash('fail', `Can't Check In After Working Hours ${department.endOfDay}`)
    }

    res.redirect('/dashboard')
})
app.post('/checkout/:id', async(req, res) => {
    const { id } = req.params
    const employee = await Employee.findById(id)
    const department = await Department.findOne({ name: employee.department })

    const currentTime = new Date()
    const day = currentTime.getDate()
    const year = currentTime.getFullYear()
    const month = currentTime.getMonth() + 1
    const endOfDay = new Date(`${year}-${month}-${day}T${department.endOfDay}:00`)
    if (endOfDay <= currentTime) {
        employee.isAvailable = false

        const log = new Log({ time: Date(), type: "checkOut" })
        log.employee = employee
        await employee.save()
        await log.save()

    } else {
        req.flash('fail', `Can't check Out before ${department.endOfDay} without a leaving request`)
    }

    res.redirect('/dashboard')
})
app.get('/request/:id', async(req, res) => {
    const { id } = req.params
    const employee = await Employee.findById(id)
    const department = await Department.findOne({ name: employee.department })
    const currentTime = new Date()
    const day = currentTime.getDate()
    const year = currentTime.getFullYear()
    const month = currentTime.getMonth() + 1
    const endOfDay = new Date(`${year}-${month}-${day}T${department.endOfDay}:00`)
    const startOfDay = new Date(`${year}-${month}-${day}T${department.startOfDay}:00`)
    console.log(endOfDay);
    console.log(startOfDay);
    console.log(currentTime);
    if (currentTime < startOfDay) {
        req.flash('fail', `Leaving requests are made during working hours ${department.startOfDay} to ${department.endOfDay}`)
        res.redirect('/dashboard')
    } else if (currentTime > endOfDay) {
        req.flash('fail', 'You can Check Out without a leaving request')
        res.redirect('/dashboard')
    } else {
        res.render('leavingRequest', employee)
    }
})
app.get('/register', async(req, res) => {
    const departments = await Department.find()
    res.render('register', { departments })
})
app.post('/logout', (req, res) => {

    req.session.employeeId = null

    res.redirect('/login')
})

app.post('/register', async(req, res) => {
    const { email, password, firstName, secondName, department } = req.body
    const hashPw = await bcrypt.hash(password, 12)
    const employee = new Employee({
        email: email,
        firstName: firstName,
        secondName: secondName,
        password: hashPw,
        department: department
    })
    await employee.save()
    res.redirect('/login')
})
app.listen(3000, () => {
    console.log('app running!!!!!!!!');
})