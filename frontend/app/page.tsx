"use client";

import { useState } from "react";
import { useUserContext } from "@/context/userContext";
import useRedirect from "@/hooks/useUserRedirect";
import { useRouter } from "next/navigation";
import { useEffect} from "react";
import ExperienceHome from "./Components/experience/CreateExperienceForm/CreateExperienceForm";

export default function Home() {
  useRedirect("/login");
  const router = useRouter();
  const { logoutUser, user, handlerUserInput, userState, updateUser, emailVerification } = useUserContext();
  const { name, photo, isVerified, bio } = user;
  const [isOpen, setIsOpen] = useState(false);
  const [displayName, setDisplayName] = useState("");

  useEffect(() => {
    if (user?.name) {
      setDisplayName(user.name);
    }
  }, [user.name]);

  // Function to navigate to Change Password page
  const handleChangePassword = () => {
    router.push("/change-password");
  };

  return (
    <div className="bg-[#082026]">
    <main className="py-[2rem] mx-[10rem]">
      <header className="flex justify-between">
        <div className="flex flex-col">
          <h1 className="text-[2rem] font-bold text-white">
            Welcome <span className="text-amber-500">{displayName}!</span>
          </h1>
          <p className="text-slate-300 italic text-[1.1rem]">{bio}</p>
        </div>
        
        <div className="flex items-center gap-4">
        <section>
        <h1>
          <button onClick={() => setIsOpen(!isOpen)} className="px-4 py-2 bg-green-600 text-white rounded-md">
            Update Bio
          </button>
        </h1>
        {isOpen && (
          <form className="mt-4 max-w-[400px] w-full">
            <div className="flex flex-col">
              <label htmlFor="bio" className="mb-1 text-[#999]">Bio</label>
              <textarea 
                name="bio"
                defaultValue={bio}
                className="px-4 py-3 border-[2px] rounded-md outline-[#2ECC71] text-gray-800"
                onChange={(e) => handlerUserInput("bio")(e)}
              />
            </div>
            <button 
              type="submit" 
              onClick={(e) => updateUser(e, { bio: userState.bio })}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md"
            >
              Update Bio
            </button>
          </form>
        )}
      </section>
          <button 
            onClick={handleChangePassword}
            className="px-4 py-2 bg-green-600 text-white rounded-md"
          >
            Change Password
          </button>
          <button 
            onClick={logoutUser}
            className="px-4 py-2 bg-green-600 text-white rounded-md"
          >
            Logout
          </button>
        </div>
      </header>
      <div className="mt-10">
        <ExperienceHome/>
      </div>
    </main>
    </div>
  );
}