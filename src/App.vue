<script setup>
// Import reactive data functionality from Vue
import { ref } from 'vue'

// Reactive data - these values can change and update the UI automatically
const drawer = ref(false) // Controls whether the navigation drawer is open
const selectedTab = ref('home') // Currently selected tab
const counter = ref(0) // Simple counter for button demo
const textInput = ref('') // Text input field value
const selectedChips = ref(['Vue', 'Vuetify']) // Selected chips array
const snackbar = ref(false) // Controls snackbar visibility

// Methods/functions
const incrementCounter = () => {
  counter.value++
}

const showSnackbar = () => {
  snackbar.value = true
}
</script>

<template>
  <!-- v-app: Required root component for all Vuetify applications -->
  <!-- Provides theming, layout structure, and base styles -->
  <v-app>
    <!-- App Bar (Top Navigation) -->
    <v-app-bar 
      color="primary" 
      dark 
      elevation="2"
      app
    >
      <!-- Menu button to toggle navigation drawer -->
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
      
      <!-- App title -->
      <v-app-bar-title>Comprartir - Vuetify Demo</v-app-bar-title>
      
      <!-- Spacer pushes the next items to the right -->
      <v-spacer></v-spacer>
      
      <!-- Icon buttons in the app bar -->
      <v-btn icon>
        <v-icon>mdi-heart</v-icon>
      </v-btn>
      <v-btn icon>
        <v-icon>mdi-magnify</v-icon>
      </v-btn>
    </v-app-bar>

    <!-- Navigation Drawer (Side Menu) -->
    <v-navigation-drawer
      v-model="drawer"
      app
      temporary
    >
      <!-- List of navigation items -->
      <v-list>
        <v-list-item
          prepend-icon="mdi-home"
          title="Home"
          @click="selectedTab = 'home'"
        ></v-list-item>
        <v-list-item
          prepend-icon="mdi-account"
          title="Profile"
          @click="selectedTab = 'profile'"
        ></v-list-item>
        <v-list-item
          prepend-icon="mdi-cog"
          title="Settings"
          @click="selectedTab = 'settings'"
        ></v-list-item>
      </v-list>
    </v-navigation-drawer>

    <!-- Main content area -->
    <v-main>
      <!-- Container provides responsive padding and centering -->
      <v-container fluid class="pa-4">
        
        <!-- Hero Section -->
        <v-row justify="center" class="mb-8">
          <v-col cols="12" md="8">
            <!-- Card component for grouped content -->
            <v-card class="text-center pa-6" elevation="3">
              <v-card-title class="text-h4 mb-4">
                Welcome to Comprartir! 🎉
              </v-card-title>
              <v-card-text class="text-h6">
                This page demonstrates various Vuetify components
              </v-card-text>
              
              <!-- Buttons with different styles -->
              <div class="mt-4">
                <v-btn color="primary" class="mr-2" @click="incrementCounter">
                  Primary Button ({{ counter }})
                </v-btn>
                <v-btn color="secondary" variant="outlined" class="mr-2">
                  Outlined Button
                </v-btn>
                <v-btn color="success" variant="text">
                  Text Button
                </v-btn>
              </div>
            </v-card>
          </v-col>
        </v-row>

        <!-- Tabs Section -->
        <v-row justify="center" class="mb-6">
          <v-col cols="12" md="10">
            <!-- Tabs component for switching between content -->
            <v-card>
              <v-tabs v-model="selectedTab" color="primary">
                <v-tab value="home">
                  <v-icon class="mr-2">mdi-home</v-icon>
                  Home
                </v-tab>
                <v-tab value="components">
                  <v-icon class="mr-2">mdi-view-dashboard</v-icon>
                  Components
                </v-tab>
                <v-tab value="forms">
                  <v-icon class="mr-2">mdi-form-select</v-icon>
                  Forms
                </v-tab>
              </v-tabs>

              <!-- Tab content windows -->
              <v-window v-model="selectedTab">
                <!-- Home tab content -->
                <v-window-item value="home">
                  <v-card-text class="pa-6">
                    <h3>Welcome Home!</h3>
                    <p>This is the home tab content. You can put any content here.</p>
                    
                    <!-- Alert component for notifications -->
                    <v-alert
                      type="info"
                      class="mt-4"
                      icon="mdi-information"
                    >
                      This is an info alert component
                    </v-alert>
                  </v-card-text>
                </v-window-item>

                <!-- Components tab content -->
                <v-window-item value="components">
                  <v-card-text class="pa-6">
                    <h3>Component Showcase</h3>
                    
                    <!-- Chips for tags/categories -->
                    <div class="mt-4 mb-4">
                      <h4>Chips (Tags):</h4>
                      <v-chip
                        v-for="chip in selectedChips"
                        :key="chip"
                        class="mr-2"
                        color="primary"
                        closable
                        @click:close="selectedChips = selectedChips.filter(c => c !== chip)"
                      >
                        {{ chip }}
                      </v-chip>
                    </div>

                    <!-- Progress indicators -->
                    <div class="mt-4 mb-4">
                      <h4>Progress Indicators:</h4>
                      <v-progress-linear
                        value="40"
                        color="primary"
                        class="mb-2"
                      ></v-progress-linear>
                      <v-progress-circular
                        :model-value="60"
                        color="secondary"
                      ></v-progress-circular>
                    </div>

                    <!-- Avatar component -->
                    <div class="mt-4">
                      <h4>Avatar:</h4>
                      <v-avatar color="primary" class="mr-2">
                        <v-icon>mdi-account</v-icon>
                      </v-avatar>
                      <v-avatar color="secondary" class="mr-2">
                        JD
                      </v-avatar>
                    </div>
                  </v-card-text>
                </v-window-item>

                <!-- Forms tab content -->
                <v-window-item value="forms">
                  <v-card-text class="pa-6">
                    <h3>Form Components</h3>
                    
                    <!-- Text input field -->
                    <v-text-field
                      v-model="textInput"
                      label="Enter some text"
                      prepend-icon="mdi-account"
                      class="mb-4"
                      hint="This is a text input with validation"
                      persistent-hint
                    ></v-text-field>

                    <!-- Select dropdown -->
                    <v-select
                      :items="['Vue.js', 'React', 'Angular', 'Svelte']"
                      label="Choose your favorite framework"
                      class="mb-4"
                    ></v-select>

                    <!-- Checkbox -->
                    <v-checkbox
                      label="I agree to the terms and conditions"
                      class="mb-4"
                    ></v-checkbox>

                    <!-- Switch toggle -->
                    <v-switch
                      label="Enable notifications"
                      class="mb-4"
                    ></v-switch>

                    <!-- Submit button that shows a snackbar -->
                    <v-btn color="success" @click="showSnackbar">
                      Submit Form
                    </v-btn>
                  </v-card-text>
                </v-window-item>
              </v-window>
            </v-card>
          </v-col>
        </v-row>

        <!-- Grid System Demo -->
        <v-row class="mb-6">
          <v-col cols="12">
            <h3 class="mb-4">Grid System (Responsive Layout)</h3>
          </v-col>
          
          <!-- These columns will stack on mobile and be side-by-side on larger screens -->
          <v-col cols="12" sm="6" md="4">
            <v-card class="pa-4" color="blue-lighten-4">
              <v-card-title>Column 1</v-card-title>
              <v-card-text>
                This column is 12/12 on mobile, 6/12 on small screens, 4/12 on medium+
              </v-card-text>
            </v-card>
          </v-col>
          
          <v-col cols="12" sm="6" md="4">
            <v-card class="pa-4" color="green-lighten-4">
              <v-card-title>Column 2</v-card-title>
              <v-card-text>
                Responsive design made easy with Vuetify's grid system
              </v-card-text>
            </v-card>
          </v-col>
          
          <v-col cols="12" sm="12" md="4">
            <v-card class="pa-4" color="orange-lighten-4">
              <v-card-title>Column 3</v-card-title>
              <v-card-text>
                Grid system automatically handles responsive breakpoints
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

      </v-container>
    </v-main>

    <!-- Snackbar for notifications (appears at bottom of screen) -->
    <v-snackbar
      v-model="snackbar"
      timeout="3000"
      color="success"
    >
      Form submitted successfully! 🎉
      
      <!-- Close button for snackbar -->
      <template v-slot:actions>
        <v-btn
          color="white"
          variant="text"
          @click="snackbar = false"
        >
          Close
        </v-btn>
      </template>
    </v-snackbar>

  </v-app>
</template>

<style scoped>
/* Custom styles for the component */
/* scoped means these styles only apply to this component */

.v-card {
  /* Add subtle hover effect to cards */
  transition: transform 0.2s ease-in-out;
}

.v-card:hover {
  transform: translateY(-2px);
}

/* Custom spacing for the main container */
.v-main {
  background-color: #f5f5f5; /* Light background */
}
</style>
