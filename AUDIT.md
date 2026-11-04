Act as a Principal Software Architect, Senior React Engineer, TypeScript Expert, UI/UX Engineer, Performance Specialist, and Production Readiness Consultant.

The objective is to transform this application from a prototype/demo state into a production-grade, scalable, maintainable, performant, and enterprise-ready application.

Before making changes, analyze the entire codebase and identify architectural issues, technical debt, performance bottlenecks, UI inconsistencies, and maintainability concerns.

=========================================

1. # ARCHITECTURE REVIEW

Review the entire application architecture.

Identify:

- Technical debt
- Poor component composition
- Tight coupling
- Code duplication
- Violations of React principles
- State management issues
- Business logic mixed with UI
- Reusability issues
- Folder structure problems

Refactor where appropriate by following:

- Separation of Concerns
- DRY
- SOLID principles
- Composition over inheritance
- Feature-based architecture
- Reusable design patterns

# ========================================= 2. COMPONENT REFACTORING

Identify oversized components.

Break large components into:

- Presentational components
- Container components
- Shared components
- Custom hooks
- Utility functions
- Context providers

Ensure:

- Better readability
- Easier maintainability
- Better testability
- Maximum component reuse

# ========================================= 3. TYPESCRIPT IMPROVEMENTS

Review the complete codebase for TypeScript quality.

Fix:

- TypeScript errors
- TypeScript warnings
- Unsafe types
- any usages
- Type assertions where avoidable
- Missing interfaces
- Missing type definitions
- Inconsistent typings

Introduce:

- Strong typing
- Generics where appropriate
- Strict type safety

Target:

- TypeScript strict mode compatibility
- Zero TypeScript errors

# ========================================= 4. CODE QUALITY

Configure and apply:

- ESLint
- Prettier

Resolve:

- All linting issues
- Unused files
- Dead code
- Unused imports
- Unused dependencies

Enforce:

- Naming conventions
- Consistent code style
- Consistent project structure

# ========================================= 5. STATE MANAGEMENT MODERNIZATION

Review the complete application state management strategy.

Categorize state into:

1. Local Component State

- Use useState and useReducer where appropriate.

2. Global Client State

- Implement Zustand for global client-side state.

Examples:

- Authentication State
- Current User
- Theme
- Sidebar State
- Modal State
- Notification State
- Selected Organization
- Selected Clinic
- Selected Store
- Selected Filters
- User Preferences
- WebRTC Call State

3. Server State

- Use TanStack Query for all API and server-related state.

Ensure:

- Clear separation between client state and server state.
- Avoid storing server data inside Zustand.
- Zustand should only manage client-side state.
- TanStack Query should manage all server state.
- Remove unnecessary Context Providers where Zustand offers a cleaner architecture.
- Optimize subscriptions and state updates to reduce unnecessary re-renders.
- Create feature-based stores.
- Follow scalable state management patterns.

Recommended Architecture:

Local State:

- useState
- useReducer

Global Client State:

- Zustand

Server State:

- TanStack Query

# ========================================= 6. MOCK BACKEND IMPLEMENTATION

Create a production-like mock backend layer.

Requirements:

- Realistic API responses
- Realistic data relationships
- Realistic loading delays
- CRUD operations
- Error states
- Empty states

Generate realistic mock data that resembles a real-world application.

# ========================================= 7. UI/UX IMPROVEMENTS

Audit the complete UI.

Improve:

- Spacing
- Layout consistency
- Typography
- Form sizing
- Card sizing
- Button sizing
- Responsive design
- Visual hierarchy

Standardize:

- Design tokens
- Font sizes
- Border radius
- Shadows
- Colors
- Component patterns

Eliminate:

- Inconsistent spacing
- Uneven layouts
- Prototype-like visuals

# ========================================= 8. PRODUCTION-GRADE VISUALS

The application should no longer feel like a prototype.

Replace:

- Placeholder data
- Placeholder images
- Low-quality assets
- Generic visuals

With:

- Realistic avatars
- Realistic product images
- Realistic banners
- Realistic listings
- Production-quality visual assets

Ensure the application feels like a real commercial product.

# ========================================= 9. LOADING STATES

Implement professional loading states.

Add:

- Skeleton screens
- Skeleton cards
- Skeleton table rows
- Skeleton forms
- Skeleton profile screens

The skeleton should closely resemble the final content layout.

# ========================================= 10. LAYOUT STABILITY & CLS PREVENTION

Audit the application for:

- Layout shifts
- Unexpected content jumps
- Rendering instability

Prevent Cumulative Layout Shift (CLS).

Reserve space for:

- Images
- Avatars
- Cards
- Tables
- Forms
- Headers
- Banners
- Dynamic content

Ensure:

- Stable rendering
- Predictable layouts
- No sudden UI movement

Implement skeleton placeholders that match final dimensions.

Fix shifts caused by:

- Async requests
- React hydration
- Image loading
- Font loading
- Conditional rendering
- Dynamic imports

Maintain consistent dimensions across:

- Cards
- Forms
- Lists
- Tables
- Detail pages

# ========================================= 11. PERFORMANCE OPTIMIZATION

Review overall application performance.

Optimize:

- Re-renders
- Expensive computations
- State updates
- Context usage
- Network requests

Apply:

- React.memo
- useMemo
- useCallback

Where justified.

Remove unnecessary work.

# ========================================= 12. ACCESSIBILITY

Improve accessibility.

Ensure:

- Semantic structure
- Accessible forms
- Keyboard navigation
- Proper labels
- Screen-reader compatibility
- Color contrast compliance

# ========================================= 13. RESPONSIVE DESIGN

Review all layouts.

Ensure:

- Mobile-first experience
- Tablet compatibility
- Desktop compatibility

Fix:

- Overflow issues
- Layout breaking points
- Improper card scaling
- Inconsistent spacing

# ========================================= 14. FOLDER STRUCTURE REVIEW

Review the current project structure.

Recommend improvements.

Organize folders for:

- Scalability
- Maintainability
- Team collaboration

# ========================================= 15. PRODUCTION READINESS AUDIT

Evaluate:

- Maintainability
- Scalability
- Performance
- Code quality
- Developer experience
- User experience

Identify all remaining technical debt.

# ========================================= 16. FINAL DELIVERABLE

Generate a detailed report containing:

1. Architectural issues found
2. UI/UX issues found
3. TypeScript issues fixed
4. Performance issues fixed
5. CLS issues fixed
6. Linting issues fixed
7. Refactoring completed
8. Components extracted
9. Reusable modules created
10. Technical debt remaining
11. Recommendations for next phase

=========================================
IMPORTANT RULES
=========================================

- Maintain existing business functionality.
- Avoid unnecessary breaking changes.
- Follow React best practices.
- Follow TypeScript best practices.
- Follow TanStack Query best practices.
- Follow scalable enterprise architecture patterns.
- Optimize for maintainability, performance, scalability, developer experience, and user experience.

Treat this project as if it will be deployed to production and maintained by a professional engineering team for many years.
