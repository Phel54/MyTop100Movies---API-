import  Database  from '../main/config/db';
import User from "../main/apps/users/user.model";
import app from "../main/server";
import {describe, expect, test} from '@jest/globals';
import dotenv from 'dotenv'
import request from 'supertest';

dotenv.config()

process.env.NODE_ENV = 'test'


let activationToken: any[] = []
let accessToken : any[] = []
const resetToken : any[] = []
const user:any[] = []

describe('User API Test for Registration,Activation,Login,Update,ForgotPassword', () => {
    beforeAll(async () => {
         Database.getInstance()
         await User.deleteMany();
    })

    let userDetails = {
        "name":{
            "first":"Chijioke",
            "last":"Phelim"
        },
        "email":"isicheiphelim20@gmail.com",
        "password":"phelim2022",
        "phoneNumber":"+233557640572",
        "gender":"Male"
    }

    //Test Registration route
    describe('/POST User Registration', () => {
        it('it should create a User', async () => {
            const res = await request(app)
                .post('/api/v1/user/signup')
                .send(userDetails)
            expect(res.status ).toEqual (200)
            expect(res.body.success).toEqual (true)
            
            activationToken.push(res.body.data.resetPasswordToken)
        })
    })

    //Test Activation route
    describe('/POST Activate User Account', () => {
        it('it should activate a User', async () => {
            const res = await request(app)
                .post(`/api/v1/User/activate/token/${activationToken[0]}`)
            expect(res.status ).toEqual (200)
            expect(res.body.success).toEqual (true)
            expect(res.body.client_message).toEqual ("user Account Activated")
        })
    })

    let userLoginDetails = {
        email: 'isicheiphelim20@gmail.com',
        password: 'phelim2022',
    }
    //Test Login route
    describe('/POST User login', () => {
        it('it should login an User', async () => {
            const res = await request(app)
                .post('/api/v1/user/login')
                .send(userLoginDetails)

            expect(res.status ).toEqual (200)
            expect(res.body.success).toEqual (true)
            expect(res.body.status).toEqual (1)
            expect(res.body.client_message).toEqual (
                'user logged in successfully'
            )
            expect(typeof res.body.data.accessToken).toBe("string")
            accessToken.push(res.body.data.accessToken)
            user.push(res.body.data.id)
        })
    })

    //Test Get One User with Id
    describe('GET User by id', () => {
        it('It should GET User by their ID', async () => {
            const user:any = await User.findOne({
                email: 'isicheiphelim20@gmail.com',
            })

            const res = await request(app)
                .get(`/api/v1/user/userId/${user._id}`)
                .set('Authorization', `bearer ${accessToken[0]}`)
            expect(res.status ).toEqual (200)
            expect(res.body.success).toEqual (true)
            expect(res.body.status).toEqual (1)
        })
    })

    //Test Get One User with email
    describe('GET User by email', () => {
        it('It should GET User by their ID', async () => {
            const res = await request(app)
                .get(`/api/v1/user/email/isicheiphelim20@gmail.com`)
                .set('Authorization', `bearer ${accessToken[0]}`)
            expect(res.status ).toEqual (200)
            expect(res.body.success).toEqual (true)
            expect(res.body.status).toEqual (1)
        })
    })

    //Test forgot password route

    let forgotPasswordEmail = {
        email: 'isicheiphelim20@gmail.com',
    }

    describe('POST User Forgot Password', () => {
        it('It should create a reset token and send', async () => {
            const res = await request(app)
                .post(`/api/v1/user/forgotpassword`)
                .send(forgotPasswordEmail)
            expect(res.status ).toEqual (200)
            expect(res.body.success).toEqual (true)
            expect(res.body.status).toEqual (1)
            expect(res.body.client_message).toEqual ("Reset code has been sent ")
            expect(typeof res.body.data).toBe('number')
            resetToken.push(res.body.data)
        })
    })

    //Test ResetPassword route

    describe('POST User Reset Password', () => {
        it('It should reset the password and save', async () => {
            let userResetDetails = {
                token: `${resetToken[0]}`,
                password: 'phelim23',
            }
            const res = await request(app)
                .post(`/api/v1/user/resetpassword`)
                .send(userResetDetails)
            expect(res.status ).toEqual (200)
            expect(res.body.status).toEqual (1)
            expect(res.body.client_message).toEqual ('Password reset successfull')
        })
    })

    /**
     *  Test update User Route
     */
    let userUpdateDetails = {
        "name.first":"Lim"
    }
    describe('/PATCH User Update ', () => {
        it('it should update the User email', async () => {

            const res = await request(app)
                .patch(`/api/v1/user/userId/${user[0]}`)
                .send(userUpdateDetails)
                .set('Authorization', `bearer ${accessToken[0]}`)
            expect(res.status ).toEqual (200)
        })
    })
    //TestDelete User Route
    describe('/Delete User Deletion ', () => {
        it('it should delete the User account', async () => {
            const res = await request(app)
                .delete(`/api/v1/user/userId/${user[0]}`)
                .set('Authorization', `bearer ${accessToken[0]}`)
            expect(res.status ).toEqual (200)
            expect(res.body.status).toEqual (1)
        })
    })
 
 
})
