// import { PROTECTED_ROUTES } from "@/routes/common/routePath"
// import { Link, useLocation } from "react-router-dom"

// const Logo = (props: { url?: string; variant?: 'light' | 'dark' }) => {
//   const location = useLocation()
//   const isHomepage = location.pathname === '/'
  
//   // Use black text for homepage, white for all other pages
//   const textColor = isHomepage ? '#1F2937' : 'white'
  
//   return (
//     <Link to={props.url || PROTECTED_ROUTES.OVERVIEW} className="flex items-center">
//       <svg viewBox="0 0 180 60" xmlns="http://www.w3.org/2000/svg" className="h-8">
//         {/* Green smooth square accent on left */}
//         <rect x="10" y="26" width="30" height="30" rx="1" ry="1" fill="#10B981"/>
//         {/* Clean, elegant typography */}
//         <text x="25" y="38" 
//               fontFamily="'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif" 
//               fontSize="48" 
//               fontWeight="350" 
//               fill={textColor} 
//               letterSpacing="0.3px">
//           Hyreliq
//         </text>
//       </svg>
//     </Link>
//   )
// }

// export default Logo

// 1

// import { PROTECTED_ROUTES } from "@/routes/common/routePath"
// import { Link, useLocation } from "react-router-dom"

// const Logo = (props: { url?: string; variant?: 'light' | 'dark' }) => {
//   const location = useLocation()
//   const isHomepage = location.pathname === '/'
  
//   // For homepage: follow theme (black for light theme, white for dark theme)
//   // For other pages: always white
//   let textColor = 'white' // default for non-homepage
  
//   if (isHomepage) {
//     // Check if dark mode is active
//     const isDarkMode = document.documentElement.classList.contains('dark') || 
//                        window.matchMedia('(prefers-color-scheme: dark)').matches
//     textColor = isDarkMode ? 'white' : '#1F2937'
//   }
  
//   return (
//     <Link to={props.url || PROTECTED_ROUTES.OVERVIEW} className="flex items-center">
//       <svg viewBox="0 0 180 60" xmlns="http://www.w3.org/2000/svg" className="h-8">
//         {/* Green smooth square accent on left */}
//         <rect x="10" y="26" width="30" height="30" rx="1" ry="1" fill="#10B981"/>
//         {/* Clean, elegant typography */}
//         <text x="25" y="38" 
//               fontFamily="'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif" 
//               fontSize="48" 
//               fontWeight="250" 
//               fill={textColor} 
//               letterSpacing="0.3px">
//           Hyreliq
//         </text>
//       </svg>
//     </Link>
//   )
// }

// export default Logo


import { PROTECTED_ROUTES } from "@/routes/common/routePath"
import { Link, useLocation } from "react-router-dom"
import { useTheme } from "@/context/theme-provider"
import { useEffect, useState } from "react"

const Logo = (props: { url?: string; variant?: 'light' | 'dark' }) => {
  const location = useLocation()
  const { theme } = useTheme()
  const [isDarkMode, setIsDarkMode] = useState(false)
  const isHomepage = location.pathname === '/'
  
  useEffect(() => {
    const checkDarkMode = () => {
      if (theme === "system") {
        setIsDarkMode(window.matchMedia("(prefers-color-scheme: dark)").matches)
      } else {
        setIsDarkMode(theme === "dark")
      }
    }
    
    checkDarkMode()
    
    // Listen for system theme changes if using system theme
    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
      mediaQuery.addEventListener('change', checkDarkMode)
      return () => mediaQuery.removeEventListener('change', checkDarkMode)
    }
  }, [theme])
  
  // For homepage: follow theme (black for light theme, white for dark theme)
  // For other pages: always white
  let textColor = 'white' // default for non-homepage
  
  if (isHomepage) {
    textColor = isDarkMode ? 'white' : '#1F2937'
  }
  
  return (
    <Link to={props.url || PROTECTED_ROUTES.OVERVIEW} className="flex items-center">
      <svg viewBox="0 0 180 60" xmlns="http://www.w3.org/2000/svg" className="h-8">
        {/* Green smooth square accent on left */}
        <rect x="10" y="26" width="30" height="30" rx="1" ry="1" fill="#10B981"/>
        {/* Clean, elegant typography */}
        <text x="25" y="38" 
              fontFamily="'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif" 
              fontSize="48" 
              fontWeight="250" 
              fill={textColor} 
              letterSpacing="0.3px">
          Hyreliq
        </text>
      </svg>
    </Link>
  )
}

export default Logo