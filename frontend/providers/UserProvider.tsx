"use client";
import React from 'react';
import {UserContextProvider} from "../context/userContext.js"

interface Props {
    children: React.ReactNode;
}
function UserProvider({children}: Props){
    return (
        <UserContextProvider>{children}</UserContextProvider>
    )
}

export default UserProvider;