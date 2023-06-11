exports.sendToken = (res, user, message, statusCode = 200) => {

    const token = user.getJWTToken();
 
    res.status(statusCode)
    .cookie("token", token, {
            maxAge: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
            httpOnly: true,
        })
    .json({
        success: true,
        message,
        token,
        user
    })
}   

   // const options = {
    //     maxAge: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    //     httpOnly: true,
    //     // / path: "/",
    //     // withCredentials : true
    //     // secure: true,w

    //     // sameSite: "none"s
    // }
        // .cookie("token", token, {
        //     maxAge: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        //     httpOnly: true,
        // })