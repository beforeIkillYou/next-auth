import { connect } from "@/dbConfig/dbConfig";  
import User from "@/models/UserModel"
import { NextRequest, NextResponse } from 'next/server'
import bcryptjs from 'bcryptjs'
import { sendEmail } from "@/helpers/mailer";

connect()

export async function POST(request: NextRequest){
    try{
        const reqBody = request.json()
        const {username, email, password} = await reqBody

        // 1. validation
        console.log(reqBody)

        const user = await User.findOne({email});
        if(user){
            return NextResponse.json(
                {error: "User already exists"},
                {status: 400}
            )
        }

        // 2. hash password
        const salt = Number(bcryptjs.genSalt(10))
        const hashedPassword = await bcryptjs.hash(password, salt)
        
        const newUser = new User({
            username,
            email,
            password:  hashedPassword
        })

        const savedUser = await newUser.save()
        console.log(savedUser)

        // 3. send verficiation email
        await sendEmail({email, emailType:"VERIFY", userId:savedUser._id})

        return NextResponse.json({
            message:"User registered successfully",
            success: true,
            savedUser
        })
    }catch(error: any){
        return NextResponse.json(
            {error: error.message},
            {status: 500}
        )
    }
}