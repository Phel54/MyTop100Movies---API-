import  Database  from '../main/config/db';
import Admin from "../main/apps/admin/admin.model";
import httpServer from "../main/index";
import {describe, expect, test} from '@jest/globals';
import dotenv from 'dotenv'
import request from 'supertest';

dotenv.config()

process.env.NODE_ENV = 'test'


let activationToken: any[] = []
let accessToken : any[] = []
const resetToken : any[] = []
const admin:any[] = []

describe('Admin API Test for Registration,Activation,Login,Update,ForgotPassword', () => {
    beforeAll(async () => {
         Database.getInstance()
         await Admin.deleteMany();
    })

    let adminDetails = {
        "name":{
            "first":"Phelim",
            "last":"Isichei"
        },
        "email":"admin@gmail.com",
        "phoneNumber":"0557640572"
    }

    //Test Registration route
    describe('/POST Admin Registration', () => {
        it('it should create an Admin', async () => {
            const res = await request(httpServer)
                .post('/api/v1/admin/signup')
                .send(adminDetails)
            expect(res.status ).toEqual (200)
            expect(res.body.success).toEqual (true)
            
            activationToken.push(res.body.data.resetPasswordToken)
        })
    })
    let changedPassword = {
        "password":"phelim2022"
    }
    //Test Activation route
    describe('/POST Activate Admin Account', () => {
        it('it should activate a Admin', async () => {
            const res = await request(httpServer)
                .post(`/api/v1/Admin/activate/token/${activationToken[0]}`)
                .send(changedPassword)
            expect(res.status ).toEqual (200)
            expect(res.body.success).toEqual (true)
            expect(res.body.client_message).toEqual ("Admin Account Activated")
        })
    })

    let adminLoginDetails = {
        email: 'admin@gmail.com',
        password: 'phelim2022',
    }
    //Test Login route
    describe('/POST Admin login', () => {
        it('it should login an Admin', async () => {
            const res = await request(httpServer)
                .post('/api/v1/admin/login')
                .send(adminLoginDetails)

            expect(res.status ).toEqual (200)
            expect(res.body.success).toEqual (true)
            expect(res.body.status).toEqual (1)
            expect(res.body.client_message).toEqual (
                'Admin logged in successfully'
            )
            expect(typeof res.body.data.accessToken).toBe("string")
            accessToken.push(res.body.data.accessToken)
            admin.push(res.body.data.id)
        })
    })

    //Test Get One Admin with Id
    describe('GET Admin by id', () => {
        it('It should GET Admin by their ID', async () => {
            const admin:any = await Admin.findOne({
                email: 'admin@gmail.com',
            })

            const res = await request(httpServer)
                .get(`/api/v1/admin/adminId/${admin._id}`)
                .set('Authorization', `bearer ${accessToken[0]}`)
            expect(res.status ).toEqual (200)
            expect(res.body.success).toEqual (true)
            expect(res.body.status).toEqual (1)
        })
    })

    //Test Get One Admin with email
    describe('GET Admin by email', () => {
        it('It should GET Admin by their ID', async () => {
            const res = await request(httpServer)
                .get(`/api/v1/admin/email/admin@gmail.com`)
                .set('Authorization', `bearer ${accessToken[0]}`)
            expect(res.status ).toEqual (200)
            expect(res.body.success).toEqual (true)
            expect(res.body.status).toEqual (1)
        })
    })

    //Test forgot password route

    let forgotPasswordEmail = {
        email: 'admin@gmail.com',
    }

    describe('POST Admin Forgot Password', () => {
        it('It should create a reset token and send', async () => {
            const res = await request(httpServer)
                .post(`/api/v1/admin/forgotpassword`)
                .send(forgotPasswordEmail)
            expect(res.status ).toEqual (200)
            expect(res.body.success).toEqual (true)
            expect(res.body.status).toEqual (1)
            expect(res.body.client_message).toEqual ("Reset code has been sent")
            expect(typeof res.body.data).toBe('number')
            resetToken.push(res.body.data)
        })
    })

    //Test ResetPassword route

    describe('POST Admin Reset Password', () => {
        it('It should reset the password and save', async () => {
            let adminResetDetails = {
                token: `${resetToken[0]}`,
                password: 'phelim23',
            }
            const res = await request(httpServer)
                .post(`/api/v1/admin/resetpassword`)
                .send(adminResetDetails)
            expect(res.status ).toEqual (200)
            expect(res.body.status).toEqual (1)
            expect(res.body.client_message).toEqual ('Password reset successfully')
        })
    })

    /**
     *  Test update Admin Route
     */
    let adminUpdateDetails = {
        "name.first":"Lim"
    }
    describe('/PATCH Admin Update ', () => {
        it('it should update the Admin email', async () => {

            const res = await request(httpServer)
                .patch(`/api/v1/admin/adminId/${admin[0]}`)
                .send(adminUpdateDetails)
                .set('Authorization', `bearer ${accessToken[0]}`)
            expect(res.status ).toEqual (200)
        })
    })
    //TestDelete Admin Route
    describe('/Delete Admin Deletion ', () => {
        it('it should delete the Admin account', async () => {
            const res = await request(httpServer)
                .delete(`/api/v1/admin/adminId/${admin[0]}`)
                .set('Authorization', `bearer ${accessToken[0]}`)
            expect(res.status ).toEqual (200)
            expect(res.body.status).toEqual (1)
        })
    })
    afterEach(async () => {
        httpServer.close()
    })
  
})
