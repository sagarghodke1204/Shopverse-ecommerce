package com.e_commerce.website.e_commerce.website.config;


import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())            // Disable CSRF for APIs
                .authorizeHttpRequests(auth -> auth.anyRequest().permitAll()) // Permit all endpoints
                .formLogin(form -> form.disable())       // Disable form login
                .httpBasic(basic -> basic.disable());    // Disable basic auth
        return http.build();
    }
}
