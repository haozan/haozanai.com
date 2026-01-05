# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).

# IMPORTANT: Do NOT add Administrator data here!
# Administrator accounts should be created manually by user.
# This seeds file is only for application data (products, categories, etc.)
#
require 'open-uri'

puts "Seeding sample portfolio data..."

# Clear existing data
Project.destroy_all
Article.destroy_all

# Create sample projects
projects_data = [
  {
    title: "Minimalist Task Manager",
    description: "A clean, fast task management app focused on simplicity and speed. Built with Rails and vanilla JavaScript for optimal performance.",
    url: "https://github.com/yourusername/task-manager",
    status: "published",
    position: 1
  },
  {
    title: "API Documentation Generator",
    description: "Automatically generates beautiful API documentation from your Rails routes and controllers. Zero configuration required.",
    url: "https://github.com/yourusername/api-docs",
    status: "published",
    position: 2
  },
  {
    title: "Portfolio Template",
    description: "A minimalist portfolio template for developers. Fast, responsive, and easy to customize.",
    url: "#",
    status: "published",
    position: 3
  },
  {
    title: "CLI Tool Collection",
    description: "A collection of command-line tools for developers. Boost your productivity with simple, focused utilities.",
    url: "https://github.com/yourusername/cli-tools",
    status: "published",
    position: 4
  },
  {
    title: "Markdown Editor",
    description: "A lightweight markdown editor with live preview. Clean interface, keyboard shortcuts, and export options.",
    url: "#",
    status: "published",
    position: 5
  },
  {
    title: "Code Snippet Manager",
    description: "Save and organize your code snippets. Search, tag, and share your most-used code blocks.",
    url: "#",
    status: "published",
    position: 6
  }
]

projects_data.each do |project_data|
  Project.create!(project_data)
  puts "  Created project: #{project_data[:title]}"
end

# Create sample articles
articles_data = [
  {
    title: "Why Minimalism Matters in Web Design",
    content: "In today's web landscape, simplicity is a competitive advantage. Users are overwhelmed with information and choices. A minimalist approach cuts through the noise and delivers what matters most: content and functionality. This article explores the principles of minimalist web design and how to apply them effectively in your projects.",
    status: "published",
    published_at: 5.days.ago
  },
  {
    title: "Building Fast Web Applications",
    content: "Performance is a feature. Every millisecond counts when it comes to user experience. In this deep dive, we'll explore techniques for building lightning-fast web applications, from server-side optimizations to frontend best practices. Learn how to measure, optimize, and deliver blazing-fast experiences to your users.",
    status: "published",
    published_at: 10.days.ago
  },
  {
    title: "The Power of System Fonts",
    content: "Web fonts are everywhere, but they come at a cost: extra HTTP requests, layout shifts, and slower page loads. System fonts offer a compelling alternative: instant rendering, zero network overhead, and native look and feel. Discover how to leverage system fonts for better performance and user experience.",
    status: "published",
    published_at: 15.days.ago
  },
  {
    title: "Designing for Developers",
    content: "As developers, we often underestimate the importance of design. But good design isn't just about aesthetics—it's about usability, accessibility, and communicating effectively. This guide covers essential design principles every developer should know, with practical examples and actionable tips.",
    status: "published",
    published_at: 20.days.ago
  },
  {
    title: "Rails 7: What's New and Why It Matters",
    content: "Rails 7 brings significant improvements to modern web development. From Hotwire for reactive interfaces without JavaScript frameworks, to better asset pipeline management, this release makes Rails more competitive than ever. Let's explore the key features and how they can streamline your development workflow.",
    status: "published",
    published_at: 25.days.ago
  }
]

articles_data.each do |article_data|
  Article.create!(article_data)
  puts "  Created article: #{article_data[:title]}"
end

puts "Seed data created successfully!"
puts "  - #{Project.count} projects"
puts "  - #{Article.count} articles"
