import 'regenerator-runtime/runtime'
import {describe, expect, test} from '@jest/globals'

const request = require('supertest');

const app = require('../app')

const mongoose = require('../node_modules/mongoose');
const User = require("../models/User")

const userControllers = require("../controllers/user");
const auth = require("../controllers/auth")

const ObjectId = require('../node_modules/mongodb').ObjectID;
require("dotenv").config({path: '../.env'});
const db_url=process.env.DB_URL;
jest.useRealTimers();

describe("Pizza Store testing", ()=>{

    beforeAll(async () => {
        await mongoose.connect(db_url, {
            useUnifiedTopology: true,
            useNewUrlParser: true,
            useCreateIndex: true,
            useFindAndModify: false,
          });
    });
    
    afterEach(async () => {
        //await mongoose.connection.dropDatabase();
        //console.log("after Each")
    });
    
    afterAll(async () => {
        //await mongoose.connection.dropDatabase();
        await mongoose.connection.db.collection('users').remove({'email': 'test@admin.com'})
        //await mongoose.connection.db.collection('categories').remove({'email': 'test@admin.com'})
        await mongoose.connection.db.collection('categories').remove({'categoryName': 'testCategory'})
        await mongoose.connection.close();
        //console.log("after All")
    });
    
    describe("Test Authentication", ()=>{
    
        test("SignUp Should return 200", async()=>{
    
            const signUpResponse = await request(app)
            .post('/api/signup')
            .send({firstName: 'test', lastName: 'test', email: 'test@admin.com', password: 'password'})
            expect(signUpResponse.statusCode).toEqual(200)
        })
    
        test("SignUp error 'User already existed'", async()=>{
    
            const expectedValue = 'User already exists! How about signing in?';
    
            const signUpResponse = await request(app)
            .post('/api/signup')
            .send({firstName: 'test', lastName: 'test', email: 'test@admin.com', password: 'password'})
    
            expect(signUpResponse.body.error).toEqual(expectedValue)
        })
    
        test("SignIn Should return 200 and as expected", async()=>{
    
            const expectedValues = {
                user:{
                    name: 'test test',
                    email: 'test@admin.com',
                    role: 0
                }
            }
    
            const signInResponse = await request(app)
            .post('/api/signin')
            .send({email: 'test@admin.com', password: 'password'})
    
            expect(signInResponse.statusCode).toEqual(200)
    
            expect(signInResponse.body.user.name).toEqual(expectedValues.user.name)
            expect(signInResponse.body.user.email).toEqual(expectedValues.user.email)
            expect(signInResponse.body.user.role).toEqual(expectedValues.user.role)
        })
    
        test("SignIn Error 'Email/Password is wrong'", async()=>{
    
            //correct input is: email: 'test@admin.com', password: 'password'
    
            const expectedValue = 'Email/Password is wrong';
    
            const signInResponseWrongEmail = await request(app)
            .post('/api/signin')
            .send({email: 'test@admin.com', password: 'wrongpassword'})
    
            expect(signInResponseWrongEmail.statusCode).toEqual(200)
            expect(signInResponseWrongEmail.body.error).toEqual(expectedValue)
    
            const signInResponseWrongPassword = await request(app)
            .post('/api/signin')
            .send({email: 'wrongEmail@admin.com', password: 'password'})
    
            expect(signInResponseWrongPassword.statusCode).toEqual(200)
            expect(signInResponseWrongPassword.body.error).toEqual(expectedValue)
        })
    
        test("SignOut Should return 200 and as expected", async()=>{
    
            const expectedValue = 'Signout successfully';
    
            const signOutResponse = await request(app)
            .post('/api/signout')
    
            expect(signOutResponse.statusCode).toEqual(200)
            expect(signOutResponse.body.message).toEqual(expectedValue)
        })
    
    })
    
    describe("Test User", ()=>{
    
        test("Get User Profile Should return 200 and as expected", async()=>{
    
            const expectedValues = {
                user:{
                    email: 'test@admin.com',
                    firstName: 'test',
                    lastName: 'test',
                    fullName: 'test test',
                    email: 'test@admin.com',
                }
            }
    
            //get user id before get user profile
            const signInResponse = await request(app)
            .post('/api/signin')
            .send({email: 'test@admin.com', password: 'password'})
    
            const userID = signInResponse.body.user.id;
    
            var cookie = signInResponse.header['set-cookie'][0].split('=')[1];
    
            const getUserProfileResponse = await request(app)
            .post('/api/user/profile')
            .set('Cookie', [
                `token=${cookie}`,
            ])
            .send({user:{id: Object(userID)}})
            expect(getUserProfileResponse.statusCode).toEqual(200)
    
            expect(getUserProfileResponse.body.user.email).toEqual(expectedValues.user.email)
            expect(getUserProfileResponse.body.user.firstName).toEqual(expectedValues.user.firstName)
            expect(getUserProfileResponse.body.user.lastName).toEqual(expectedValues.user.lastName)
            expect(getUserProfileResponse.body.user.fullName).toEqual(expectedValues.user.fullName)
            expect(getUserProfileResponse.body.user._id).toEqual(userID)
        })
    
        test("addAddress Should return 200 and as expected", async()=>{
    
            const expectedValue = "The address was added";
    
            //get user ID
            const signInResponse = await request(app)
            .post('/api/signin')
            .send({email: 'test@admin.com', password: 'password'})
     
            const userID = signInResponse.body.user.id;
    
            var cookie = signInResponse.header['set-cookie'][0].split('=')[1];
    
            const addAddressRes = await request(app)
            .post('/api/user/address/add')
            .set('Cookie', [
                `token=${cookie}`,
            ])
            .send({
                address:{
                    buildingNumber: "testBuilding",
                    streetName: 'test St',
                    area: 'test Area',
                    city: 'test City',
                    zipcode: '123456',
                    phoneNumber: '0123456789'
                },
                user:{id: Object(userID)}
            })
    
            expect(addAddressRes.statusCode).toEqual(200)
            expect(addAddressRes.body.message).toEqual(expectedValue)
        })
    
    })
    
    describe("Test Admin", ()=>{
    
        test("Admin add category Should return 200 and as expected", async()=>{
    
            const expectedValues = {
                user:{
                    email: 'test@admin.com',
                    firstName: 'test',
                    lastName: 'test',
                    fullName: 'test test',
                    email: 'test@admin.com',
                }
            }
    
            //get user ID
            const signInResponse = await request(app)
            .post('/api/signin')
            .send({email: 'admin@pizzetta.com', password: 'password'})
    
            const userID = signInResponse.body.user.id;

            var cookie = signInResponse.header['set-cookie'][0].split('=')[1];
    
            const addCategoryRes = await request(app)
            .post('/api/admin/category/create')
            .set('Cookie', [
                `token=${cookie}`,
            ])
            .send({
                user:{
                    id: Object(userID),
                    role: 1,
                },
                categoryName: "testCategory",
            })
            expect(addCategoryRes.statusCode).toEqual(200)
            expect(addCategoryRes.body.message).toEqual("Category: 'testCategory' created")
    
            
        })
    
        /*test("Admin Add Item Should return 200 and as an expected", async()=>{
    
            const expectedValue = "Address added";
    
             //get user ID
             const signInResponse = await request(app)
             .post('/api/signin')
             .send({email: 'admin@pizzetta.com', password: 'password'})
     
             const userID = signInResponse.body.user.id;
    
            const addAddressRes = await request(app)
            .post('/api/admin/item/create')
            .set('Cookie', [
                'token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYxYzBiYjcwZjNjM2U4MzRiOGU5NmQzOCIsInJvbGUiOjEsImlhdCI6MTY0MDAyMzk4MX0.MXyYdWaTEgO6J6ApRpCB913X1bGjFBxaNsNbD1c3ugI',
            ])
            .send({
                itemName: 'May',
                itemAvailable: 'true',
                itemCategory: '61c0dc44f10ee82cecbc940b',
                size: {
                    regular:"9.99",
                    medium:"19.99",
                    large:"39.99"
                },
                address:{
                    buildingNumber: "testBuilding",
                    streetName: 'test St',
                    area: 'test Area',
                    city: 'test City',
                    zipcode: '123456',
                    phoneNumber: '0123456789'
                },
                user:{id: Object(userID)}
            })
    
            expect(addAddressRes.statusCode).toEqual(200)
            expect(addAddressRes.body.message).toEqual(expectedValue)
        })*/
    
    })

})