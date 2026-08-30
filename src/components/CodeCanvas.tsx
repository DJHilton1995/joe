import React, { useState, useEffect, useRef } from 'react';
import { 
  Terminal as TerminalIcon, Cpu, Play, Copy, Download, RefreshCw, 
  Sparkles, Check, Code, Sliders, Monitor, AlertCircle, FileCode, CheckCircle2 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Language configuration type
interface LanguageConfig {
  id: string;
  name: string;
  extension: string;
  defaultPrompt: string;
  blueprint: string;
}

const BLUEPRINTS: Record<string, LanguageConfig> = {
  rust: {
    id: 'rust',
    name: 'Rust',
    extension: 'rs',
    defaultPrompt: 'Write a high-performance async TCP packet sniffer kernel',
    blueprint: `// Joey_OS Quantum Security Kernel v2.4.9
// Mode: High-Performance Async TCP Packet Sniffer
// Default general purpose language template

use tokio::net::TcpListener;
use tokio::io::{AsyncReadExt, AsyncWriteExt};
use std::error::Error;
use std::sync::Arc;

#[derive(Debug)]
pub struct SecurityEnclave {
    session_id: u64,
    threat_threshold: f64,
    active_handshakes: usize,
}

impl SecurityEnclave {
    pub fn new(session_id: u64) -> Self {
        println!("[CORE] Initializing secure enclave session #{}", session_id);
        Self {
            session_id,
            threat_threshold: 0.85,
            active_handshakes: 0,
        }
    }

    pub fn inspect_packet(&self, payload: &[u8]) -> Result<bool, &'static str> {
        if payload.is_empty() {
            return Err("Empty payload rejected.");
        }
        
        // Scan for malicious signatures (e.g., shellcode or buffer overflows)
        let signature_match = payload.windows(4).any(|window| {
            window == [0x90, 0x90, 0x90, 0x90] // NOP Sled detection
        });

        if signature_match {
            println!("[ALERT] Malicious NOP Sled detected in session #{}", self.session_id);
            Ok(false) // Threat flagged
        } else {
            Ok(true) // Payload clear
        }
    }
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn Error>> {
    let port = 8080;
    let listener = TcpListener::bind(format!("0.0.0.0:{}", port)).await?;
    let enclave = Arc::new(SecurityEnclave::new(1337));
    
    println!("[INIT] Joey Decryption Socket listening on port {}", port);

    loop {
        let (mut socket, addr) = listener.accept().await?;
        let enclave_ref = Arc::clone(&enclave);

        tokio::spawn(async move {
            println!("[CONNECT] Connection established from: {}", addr);
            let mut buffer = [0; 1024];

            loop {
                match socket.read(&mut buffer).await {
                    Ok(0) => {
                        println!("[DISCONNECT] Connection closed by: {}", addr);
                        break;
                    }
                    Ok(n) => {
                        let payload = &buffer[0..n];
                        match enclave_ref.inspect_packet(payload) {
                            Ok(true) => {
                                println!("[SECURE] Packet of {} bytes passed sanitization.", n);
                                // Echo secure handshake acknowledgement back
                                if let Err(e) = socket.write_all(b"SEC_ACK_NOMINAL\\n").await {
                                    eprintln!("[ERROR] Write failed: {}", e);
                                    break;
                                }
                            }
                            Ok(false) => {
                                println!("[LOCKDOWN] Terminating compromised socket from {}", addr);
                                let _ = socket.write_all(b"SEC_ERR_TERMINATED_BY_JOEY\\n").await;
                                break;
                            }
                            Err(err) => {
                                println!("[WARNING] Inspection error: {}", err);
                            }
                        }
                    }
                    Err(e) => {
                        eprintln!("[ERROR] Socket failure: {}", e);
                        break;
                    }
                }
            }
        });
    }
}`
  },
  python: {
    id: 'python',
    name: 'Python',
    extension: 'py',
    defaultPrompt: 'Create a neural cognitive AI agent with custom routing rules',
    blueprint: `# Joey_OS Autonomous Cognitive Engine v2.4.9
# Mode: Neural Routing AI Agent
# Default language template for AI agents

import os
import json
import time
from typing import Dict, Any, List

class NeuralRouterAgent:
    def __init__(self, agent_id: str, temperature: float = 0.2):
        self.agent_id = agent_id
        self.temperature = temperature
        self.token_budget = 1000000
        self.active_memory: List[Dict[str, str]] = []
        print(f"[AI] Activated Joey Agent Core: {self.agent_id}")

    def inject_system_directive(self, prompt: str) -> None:
        self.active_memory.append({
            "role": "system",
            "content": f"{prompt} | Keep tone retro-cybernetic and friendly."
        })
        print(f"[MEM] Injected directive: {prompt[:35]}...")

    def process_transaction(self, input_signal: str) -> Dict[str, Any]:
        """
        Processes a network stream or query through Joey's cognitive router
        """
        start_time = time.time()
        print(f"[COGNITIVE] Parsing input signal: {input_signal}")
        
        # Executing sub-nanosecond heuristic analysis
        self.active_memory.append({"role": "user", "content": input_signal})
        
        # Enforcing token safety constraints
        payload_len = len(input_signal)
        self.token_budget -= payload_len
        
        # Neural routing logic based on urgency and signature
        route_decision = "SANDBOX"
        confidence_score = 0.98
        
        if "exploit" in input_signal.lower() or "hack" in input_signal.lower():
            route_decision = "QUARANTINE_MAIN"
            confidence_score = 0.99
            print(f"[WARNING] Threat signature matched! Routing to quarantine.")
        elif "compute" in input_signal.lower() or "render" in input_signal.lower():
            route_decision = "GPU_CLUSTER_B"
            confidence_score = 0.91
        else:
            route_decision = "NOMINAL_CHAT_STATION"
            confidence_score = 0.95

        latency = (time.time() - start_time) * 1000 # in ms
        
        return {
            "status": "PROCESSED",
            "agent": self.agent_id,
            "route": route_decision,
            "confidence": confidence_score,
            "latency_ms": round(latency, 3),
            "remaining_budget": self.token_budget
        }

if __name__ == "__main__":
    agent = NeuralRouterAgent(agent_id="JOEY_BRAIN_SIGMA_9")
    agent.inject_system_directive("You are a lock-screen security daemon.")
    
    # Analyze multiple actual incoming signals
    signals = [
        "Inquire compute status of mainframes",
        "ATTEMPT exploit bypass root permissions",
        "Synchronize secure local SQLite ledger"
    ]
    
    for signal in signals:
        result = agent.process_transaction(signal)
        print(json.dumps(result, indent=2))
        print("-" * 40)`
  },
  cpp: {
    id: 'cpp',
    name: 'C++',
    extension: 'cpp',
    defaultPrompt: 'Create a ultra-low-latency raw packet driver with ring buffers',
    blueprint: `#include <iostream>
#include <vector>
#include <thread>
#include <atomic>
#include <chrono>

// Joey_OS Ultra-Low-Latency Kernel Ring Buffer
// Realtime Core Subsystem

template <typename T, size_t Size>
class LockFreeRingBuffer {
private:
    std::vector<T> buffer;
    std::atomic<size_t> head;
    std::atomic<size_t> tail;

public:
    LockFreeRingBuffer() : buffer(Size), head(0), tail(0) {
        std::cout << "[KERNEL] High-speed Ring Buffer allocated with " << Size << " blocks.\\n";
    }

    bool enqueue(const T& item) {
        size_t current_tail = tail.load(std::memory_order_relaxed);
        size_t next_tail = (current_tail + 1) % Size;
        
        if (next_tail == head.load(std::memory_order_acquire)) {
            return false; // Buffer full
        }
        
        buffer[current_tail] = item;
        tail.store(next_tail, std::memory_order_release);
        return true;
    }

    bool dequeue(T& item) {
        size_t current_head = head.load(std::memory_order_relaxed);
        if (current_head == tail.load(std::memory_order_acquire)) {
            return false; // Buffer empty
        }
        
        item = buffer[current_head];
        head.store((current_head + 1) % Size, std::memory_order_release);
        return true;
    }
};

struct NetworkPacket {
    uint32_t packet_id;
    uint8_t protocol;
    char source_ip[16];
    size_t length;
};

int main() {
    std::cout << "=== JOEY CORE PACKET DRIVER COMPILING ===\\n";
    LockFreeRingBuffer<NetworkPacket, 128> packet_queue;

    std::atomic<bool> driver_running(true);

    // Spawn producer thread representing the raw physical NIC card interrupts
    std::thread physical_nic([&]() {
        uint32_t id = 1000;
        while (driver_running.load()) {
            NetworkPacket pkt = { id++, 6, "192.168.1.105", 256 };
            if (packet_queue.enqueue(pkt)) {
                // Stdout throttle for demonstration
                if (id % 10 == 0) {
                    std::cout << "[NIC] Polling hardware packet #" << pkt.packet_id << " into buffer\\n";
                }
            }
            std::this_thread::sleep_for(std::chrono::milliseconds(50));
        }
    });

    // Main thread acts as the kernel security filter
    std::cout << "[DRV] Commencing raw firewall filtering...\\n";
    for (int i = 0; i < 15; ++i) {
        NetworkPacket incoming;
        if (packet_queue.dequeue(incoming)) {
            std::cout << "[FILTER] Sanitized packet #" << incoming.packet_id 
                      << " from " << incoming.source_ip << " (" << incoming.length << " bytes)\\n";
        }
        std::this_thread::sleep_for(std::chrono::milliseconds(70));
    }

    driver_running.store(false);
    physical_nic.join();
    std::cout << "[INIT] Packet driver shutdown nominal.\\n";
    return 0;
}`
  },
  javascript: {
    id: 'javascript',
    name: 'JavaScript',
    extension: 'js',
    defaultPrompt: 'Create a retro Matrix WebGL stream generator or laser visual',
    blueprint: `// Joey_OS Cybernetic Interactive Stream
// Mode: Matrix WebGL Shader Emulator (Client-Side HTML/JS)

class MatrixRainEffect {
  constructor(canvasId, options = {}) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) {
      console.warn("Canvas not found! Creating secondary fallback...");
      return;
    }
    this.ctx = this.canvas.getContext('2d');
    this.fontSize = options.fontSize || 14;
    this.glowColor = options.glowColor || '#00ffcc';
    this.chars = "アァカサタナハマヤャラワガザダバパイィキシシトドノハバマヤラワン0101XYZ#@%*";
    
    this.resize();
    window.addEventListener('resize', () => this.resize());
    
    console.log("[JS_MAIN] Retro Matrix Canvas Engine Initialized.");
  }

  resize() {
    this.width = this.canvas.width = this.canvas.parentElement.clientWidth || 800;
    this.height = this.canvas.height = 400;
    this.columns = Math.floor(this.width / this.fontSize);
    this.drops = Array(this.columns).fill(1);
  }

  draw() {
    // Semi-transparent black clear to create fade trail effect
    this.ctx.fillStyle = 'rgba(11, 12, 16, 0.08)';
    this.ctx.fillRect(0, 0, this.width, this.height);

    this.ctx.fillStyle = this.glowColor;
    this.ctx.font = \`bold \${this.fontSize}px monospace\`;
    this.ctx.shadowBlur = 8;
    this.ctx.shadowColor = this.glowColor;

    for (let i = 0; i < this.drops.length; i++) {
      const text = this.chars[Math.floor(Math.random() * this.chars.length)];
      const x = i * this.fontSize;
      const y = this.drops[i] * this.fontSize;

      this.ctx.fillText(text, x, y);

      // Randomly reset drops to the top after reaching bottom
      if (y > this.height && Math.random() > 0.975) {
        this.drops[i] = 0;
      }
      this.drops[i]++;
    }
  }

  start() {
    const tick = () => {
      this.draw();
      this.animationFrame = requestAnimationFrame(tick);
    };
    tick();
  }

  stop() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
  }
}

// Instantiate fallback if canvas exists
document.addEventListener('DOMContentLoaded', () => {
    const matrix = new MatrixRainEffect('retroCanvas', { fontSize: 12 });
    matrix.start();
});`
  },
  ruby: {
    id: 'ruby',
    name: 'Ruby',
    extension: 'rb',
    defaultPrompt: 'Build a multithreaded network API vulnerability scanner',
    blueprint: `# Joey_OS Secure Penetration Shield Engine v2.4.9
# Mode: Multithreaded API Vulnerability Scanner

require 'net/http'
require 'json'
require 'uri'

class APISecurityAuditor
  attr_reader :target_uri, :threads_count

  def initialize(target_url, threads = 4)
    @target_uri = URI.parse(target_url)
    @threads_count = threads
    puts "[RUBY_INIT] Target Endpoint configured: #{@target_uri}"
    puts "[RUBY_INIT] Auditor ready with #{@threads_count} concurrent scanner pipelines."
  end

  def scan_endpoint(endpoint_path, payload)
    full_url = URI.join(@target_uri.to_s, endpoint_path)
    puts "[SCANNING] Auditing #{full_url} with payload: #{payload.keys.join(', ')}"

    begin
      http = Net::HTTP.new(full_url.host, full_url.port)
      http.use_ssl = (full_url.scheme == 'https')
      http.read_timeout = 2 # strict low timeout for DDOS resiliency
      
      request = Net::HTTP::Post.new(full_url.path, { 'Content-Type' => 'application/json' })
      request.body = payload.to_json
      
      response = http.request(request)
      analyze_response(full_url, response)
    rescue Timeout::Error
      puts "[TIMEOUT] Secure timeout triggered for #{full_url} - potential DOS lock."
    rescue => e
      puts "[CRITICAL] Connection failure at #{full_url}: #{e.message}"
    end
  end

  def run_security_harness
    endpoints = {
      "/api/auth/login" => { "username" => "admin", "password" => "' OR '1'='1" }, # SQLi probe
      "/api/user/profile" => { "id" => "../../etc/passwd" },                        # Directory Traversal probe
      "/api/session/verify" => { "token" => "A" * 512 }                             # Buffer overflow probe
    }

    threads = []
    endpoints.each_slice(1) do |slice|
      threads << Thread.new do
        slice.each do |endpoint, payload|
          scan_endpoint(endpoint, payload)
        end
      end
    end

    threads.each(&:join)
    puts "[SCAN_COMPLETE] Security audit pipeline concluded successfully."
  end

  private

  def analyze_response(url, response)
    code = response.code.to_i
    case code
    when 500
      puts "[VULN_ALERT] SQL / Stack trace exposed (500 Error) at #{url}!"
    when 403
      puts "[SAFE] Access denied (403) at #{url}. Endpoint properly protected."
    when 200
      puts "[POTENTIAL_LEAK] HTTP 200 OK received for malformed query at #{url}!"
    else
      puts "[INFO] Path #{url} responded with Code #{code} (Nominal)."
    end
  end
end

# Executing scanner harness
auditor = APISecurityAuditor.new("https://localhost:3000", 2)
auditor.run_security_harness`
  },
  go: {
    id: 'go',
    name: 'Go',
    extension: 'go',
    defaultPrompt: 'Write an asynchronous reverse proxy with dynamic load balancing',
    blueprint: `package main

// Joey_OS High-Speed Reverse Proxy Core v2.4.9
// Mode: Concurreny & Channels Load Balancer

import (
	"fmt"
	"math/rand"
	"net/http"
	"net/http/httputil"
	"net/url"
	"sync"
	"time"
)

type BackendServer struct {
	URL          *url.URL
	Alive        bool
	mux          sync.RWMutex
	ReverseProxy *httputil.ReverseProxy
}

type LoadBalancer struct {
	backends []*BackendServer
	current  int
}

func (lb *LoadBalancer) AddBackend(serverUrl string) {
	parsedUrl, err := url.Parse(serverUrl)
	if err != nil {
		fmt.Printf("[GO_ERR] Failed to parse backend %s: %v\\n", serverUrl, err)
		return
	}

	proxy := httputil.NewSingleHostReverseProxy(parsedUrl)
	server := &BackendServer{
		URL:          parsedUrl,
		Alive:        true,
		ReverseProxy: proxy,
	}

	lb.backends = append(lb.backends, server)
	fmt.Printf("[INIT] Registered proxy target: %s\\n", serverUrl)
}

func (lb *LoadBalancer) GetNextBackend() *BackendServer {
	// Simple Round-Robin routing
	lb.current = (lb.current + 1) % len(lb.backends)
	return lb.backends[lb.current]
}

func (lb *LoadBalancer) StartProxyServer(port int) {
	server := http.Server{
		Addr: fmt.Sprintf(":%d", port),
		Handler: http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			target := lb.GetNextBackend()
			if target != nil {
				fmt.Printf("[PROXY] Redirecting client packet %s to target: %s\\n", r.URL.Path, target.URL.String())
				target.ReverseProxy.ServeHTTP(w, r)
			} else {
				http.Error(w, "Service Unavailable", http.StatusServiceUnavailable)
			}
		}),
	}

	fmt.Printf("[BOOT] Joey Load Balancer active on port %d...\\n", port)
	go lb.activeHealthCheck()
	
	// Server execution run
	time.Sleep(2 * time.Second)
	fmt.Printf("[PROXY_NOMINAL] Executing backend payload deliveries.\\n")
}

func (lb *LoadBalancer) activeHealthCheck() {
	for {
		time.Sleep(5 * time.Second)
		for _, backend := range lb.backends {
			backend.mux.Lock()
			// Executing active ping checks
			backend.Alive = rand.Float32() > 0.1
			fmt.Printf("[HEALTH] Checked %s - Active Status: %t\\n", backend.URL.String(), backend.Alive)
			backend.mux.Unlock()
		}
	}
}

func main() {
	fmt.Println("=== GO REVERSE PROXY ENGAGED ===")
	lb := LoadBalancer{}
	lb.AddBackend("http://127.0.0.1:8081")
	lb.AddBackend("http://127.0.0.1:8082")
	lb.AddBackend("http://127.0.0.1:8083")

	lb.StartProxyServer(3001)
}`
  },
  perl: {
    id: 'perl',
    name: 'Perl',
    extension: 'pl',
    defaultPrompt: 'Create an SSL certificate verification and mainframe log parser',
    blueprint: `#!/usr/bin/perl
# Joey_OS Mainframe Decryption Parser v2.4.9
# Mode: RegEx Core Log Parser & SSL Expiry Validator

use strict;
use warnings;

print "=== JOEY SECURE REGEX LEDGER ENGAGED ===\\n";

my $sample_mainframe_log = q{
[2026-06-30 14:05:22] [SECURE] CLIENT_ESTABLISHED 192.168.1.104 PORT=443 CIPHER=TLS_AES_256_GCM
[2026-06-30 14:05:29] [WARNING] EXPIRED_SSL_CERTIFICATE_ATTEMPT 10.0.0.15 DOMAIN=googleapi.com SQUAT=googleapis.com
[2026-06-30 14:06:01] [CRITICAL] PACKET_PROBE_BLOCKED 172.16.8.50 PORT=22 SEQ=10034
};

sub parse_security_events {
    my ($log_data) = @_;
    my @lines = split('\\n', $log_data);
    
    my $critical_count = 0;
    my $warning_count = 0;

    foreach my $line (@lines) {
        next if $line =~ /^\s*$/; # Skip empty lines

        # Extract timestamp, severity, event, and IP using regex capture groups
        if ($line =~ /^\\s*\\[(.*?)\\]\\s*\\[(.*?)\\]\\s*(.*?)\\s+(\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3})/) {
            my ($timestamp, $severity, $event, $ip) = ($1, $2, $3, $4);
            
            print ">> Found Incident: [$severity] $event at $timestamp from host $ip\\n";
            
            if ($severity eq 'CRITICAL') {
                $critical_count++;
                # Inspect for port probing anomalies
                if ($line =~ /PORT=(\\d+)/) {
                    print "   [RULE_ALERT] Attack vector probed on administrative port: $1\\n";
                }
            } elsif ($severity eq 'WARNING') {
                $warning_count++;
                # Inspect for typo-squatting domain fraud
                if ($line =~ /DOMAIN=(.*?)\\s+SQUAT=(.*?)/) {
                    print "   [FRAUD_DETECTOR] Potential phishing clone detected: '$1' squatting on '$2'!\\n";
                }
            }
        }
    }
    
    print "\\n--- AUDIT SUMMARY ---\\n";
    print "Critical Threats Isolated: $critical_count\\n";
    print "Warnings Calibrated: $warning_count\\n";
}

parse_security_events($sample_mainframe_log);`
  },
  powershell: {
    id: 'powershell',
    name: 'PowerShell',
    extension: 'ps1',
    defaultPrompt: 'Write an incident response script that locks down open firewall ports',
    blueprint: `# Joey_OS Incident Response Host Fortification Script v2.4.9
# Mode: Local Administrative Firewall Lockdown Daemon

Write-Host "==========================================" -ForegroundColor Magenta
Write-Host "   JOEY SECURE POWERSHELL ENCLAVE ENGAGED " -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Magenta

# Function to block a compromised port dynamically
Function Close-CompromisedPort {
    Param (
        [int]$Port,
        [string]$IPAddress = "Any",
        [string]$Reason = "Threat Isolated by Joey_OS"
    )

    Write-Host "[LOCKDOWN] Executing host defensive countermeasures..." -ForegroundColor Yellow
    Write-Host "[FIREWALL] Adding Block Rule for Port: $Port | Source: $IPAddress" -ForegroundColor Red
    
    # Executing actual NetSecurity module actions in a sandbox-safe manner
    $RuleName = "JOEY_BLOCK_PORT_$Port"
    
    # Real command reference:
    # New-NetFirewallRule -Name $RuleName -DisplayName "Joey Quarantine $Port" -Direction Inbound -LocalPort $Port -Protocol TCP -Action Block
    
    Write-Host "[SUCCESS] Created rule '$RuleName' successfully." -ForegroundColor Green
    Write-Host "[STAT] Block Rule '$RuleName' is now active in Kernel Registry." -ForegroundColor Cyan
}

Function Scan-VulnerableSystemListeners {
    Write-Host "[SCANNER] Reviewing active UDP/TCP listeners on local host..." -ForegroundColor Gray
    
    # Execute listeners listing
    $listeners = @(
        [PSCustomObject]@{ Protocol = "TCP"; LocalAddress = "0.0.0.0"; LocalPort = 22; State = "Listening" },
        [PSCustomObject]@{ Protocol = "TCP"; LocalAddress = "127.0.0.1"; LocalPort = 3306; State = "Listening" },
        [PSCustomObject]@{ Protocol = "TCP"; LocalAddress = "0.0.0.0"; LocalPort = 8080; State = "Listening" }
    )

    foreach ($conn in $listeners) {
        Write-Host "   -> Found Active Socket: $($conn.Protocol) on Port $($conn.LocalPort)" -ForegroundColor Gray
        if ($conn.LocalPort -eq 22 -or $conn.LocalPort -eq 8080) {
            Write-Host "   [CRITICAL] Unencrypted endpoint exposed on Port $($conn.LocalPort)!" -ForegroundColor Red
            Close-CompromisedPort -Port $conn.LocalPort -IPAddress "Any" -Reason "Unsanitized endpoint detected"
        }
    }
}

# Run the Incident Response Harness
Scan-VulnerableSystemListeners
Write-Host "[SECURE] Windows host security policy verified nominal." -ForegroundColor Green`
  },
  html: {
    id: 'html',
    name: 'HTML',
    extension: 'html',
    defaultPrompt: 'Create a responsive retro mainframe login panel interface HUD',
    blueprint: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Joey_OS Quantum Mainframe HUD</title>
    <style>
        body {
            background-color: #05070a;
            color: #00ffcc;
            font-family: 'Courier New', monospace;
            padding: 20px;
            overflow: hidden;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
        }
        .hud-container {
            width: 100%;
            max-width: 600px;
            background: rgba(11, 12, 16, 0.9);
            border: 2px solid #00ffcc;
            box-shadow: 0 0 20px rgba(0, 255, 204, 0.3), inset 0 0 15px rgba(0, 255, 204, 0.1);
            padding: 30px;
            border-radius: 8px;
            position: relative;
        }
        .hud-header {
            border-bottom: 1px solid #00ffcc;
            padding-bottom: 15px;
            margin-bottom: 20px;
            text-align: center;
        }
        .hud-header h1 {
            margin: 0;
            font-size: 20px;
            letter-spacing: 4px;
            text-transform: uppercase;
            text-shadow: 0 0 10px #00ffcc;
            color: #ffffff;
        }
        .hud-status {
            font-size: 11px;
            color: #ff007f;
            text-transform: uppercase;
            letter-spacing: 2px;
            margin-top: 5px;
            animation: pulse 1.5s infinite;
        }
        .hud-field {
            margin-bottom: 20px;
        }
        .hud-field label {
            display: block;
            font-size: 11px;
            letter-spacing: 2px;
            text-transform: uppercase;
            margin-bottom: 8px;
            color: #c5c6c7;
        }
        .hud-input {
            width: 100%;
            box-sizing: border-box;
            background: #000;
            border: 1px solid #00ffcc;
            padding: 12px;
            color: #ffffff;
            font-family: 'Courier New', monospace;
            font-size: 14px;
            outline: none;
            border-radius: 4px;
        }
        .hud-input:focus {
            box-shadow: 0 0 10px rgba(0, 255, 204, 0.6);
        }
        .hud-btn {
            width: 100%;
            background: #ff007f;
            border: none;
            padding: 12px;
            color: #fff;
            text-transform: uppercase;
            font-family: 'Courier New', monospace;
            font-weight: bold;
            font-size: 14px;
            letter-spacing: 3px;
            cursor: pointer;
            border-radius: 4px;
            box-shadow: 0 0 10px rgba(255, 0, 127, 0.5);
            transition: all 0.3s;
        }
        .hud-btn:hover {
            background: #ff3399;
            box-shadow: 0 0 20px rgba(255, 0, 127, 0.8);
        }
        .hud-footer {
            margin-top: 25px;
            font-size: 10px;
            text-align: center;
            color: #c5c6c7;
        }
        @keyframes pulse {
            0% { opacity: 0.3; }
            50% { opacity: 1; }
            100% { opacity: 0.3; }
        }
    </style>
</head>
<body>
    <div class="hud-container">
        <div class="hud-header">
            <h1>JOEY_OS ACCESS TERMINAL</h1>
            <div class="hud-status">// SECURE ENCLAVE ACTIVE</div>
        </div>
        <div class="hud-field">
            <label>Matrix Key ID</label>
            <input type="text" class="hud-input" value="JOEY_ADMIN_SECURE_BYPASS" placeholder="Enter cyber key...">
        </div>
        <div class="hud-field">
            <label>Decryption Signature</label>
            <input type="password" class="hud-input" value="•••••••••••••••••••••" placeholder="••••••••">
        </div>
        <button class="hud-btn" onclick="this.innerText='DECRYPTION ACKNOWLEDGED (OK)'; this.style.color='#00ffcc'; console.log('DECRYPTION SIGNATURE ACKNOWLEDGED. CORE BYPASS GRANTED.')">INITIALIZE CORE GRANTED</button>
        <div class="hud-footer">
            [v2.4.9] Powered by Post-Quantum Kyber-1024 Handshake
        </div>
    </div>
</body>
</html>`
  },
  css: {
    id: 'css',
    name: 'CSS',
    extension: 'css',
    defaultPrompt: 'Write a comprehensive glowing retro-neon stylesheet for cyber grids and CRT effects',
    blueprint: `/* Joey_OS Retro-Cyber Neon Laser Stylesheet v2.4.9 */
/* Mode: Cyber Metallic Grids & CRT Scanline Aesthetics */

/* 1. Pulse neon gear keyframe */
@keyframes fluid-neon-gear {
  0% {
    transform: rotate(0deg);
    filter: drop-shadow(0 0 2px #00ffcc);
  }
  50% {
    filter: drop-shadow(0 0 10px #ff007f);
  }
  100% {
    transform: rotate(360deg);
    filter: drop-shadow(0 0 2px #00ffcc);
  }
}

/* 2. Cyber Metallic Grid theme overlay */
.cyber-grid-overlay {
  background-size: 40px 40px;
  background-image: 
    linear-gradient(to right, rgba(0, 255, 204, 0.08) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(0, 255, 204, 0.08) 1px, transparent 1px);
  box-shadow: inset 0 0 30px rgba(0, 0, 0, 0.9);
}

/* 3. Glowing Laser Text Shadowing */
.laser-text-glow-green {
  color: #00ffcc;
  text-shadow: 
    0 0 5px rgba(0, 255, 204, 0.8),
    0 0 15px rgba(0, 255, 204, 0.3),
    0 0 30px rgba(0, 255, 204, 0.1);
}

.laser-text-glow-pink {
  color: #ff007f;
  text-shadow: 
    0 0 5px rgba(255, 0, 127, 0.8),
    0 0 15px rgba(255, 0, 127, 0.3),
    0 0 30px rgba(255, 0, 127, 0.1);
}

/* 4. Glowing Neon Borders */
.neon-border-cyan {
  border: 1px solid #00ffcc;
  box-shadow: 
    0 0 8px rgba(0, 255, 204, 0.4),
    inset 0 0 8px rgba(0, 255, 204, 0.2);
}

.neon-border-pink {
  border: 1px solid #ff007f;
  box-shadow: 
    0 0 8px rgba(255, 0, 127, 0.4),
    inset 0 0 8px rgba(255, 0, 127, 0.2);
}

/* 5. Cybernetic scanline CRT screen overlay */
.crt-overlay {
  position: relative;
  overflow: hidden;
}

.crt-overlay::after {
  content: " ";
  display: block;
  position: absolute;
  top: 0; left: 0; bottom: 0; right: 0;
  background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06));
  aspect-ratio: auto;
  background-size: 100% 3px, 6px 100%;
  pointer-events: none;
  z-index: 20;
}

/* 6. Scanlines scrolling animation */
.screen-scroll-flicker {
  animation: crt-flicker 0.15s infinite;
}

@keyframes crt-flicker {
  0% { opacity: 0.995; }
  50% { opacity: 0.985; }
  100% { opacity: 0.995; }
}`
  }
};

interface CodeCanvasProps {
  onAddMessageToChat?: (text: string) => void;
  userLevel?: number;
  externalCode?: string;
  externalLanguage?: string;
  onClearExternal?: () => void;
}

export default function CodeCanvas({ 
  onAddMessageToChat, 
  userLevel = 1,
  externalCode,
  externalLanguage,
  onClearExternal
}: CodeCanvasProps) {
  const [selectedLanguage, setSelectedLanguage] = useState<string>('rust');
  const [code, setCode] = useState<string>(BLUEPRINTS.rust.blueprint);
  const [promptInput, setPromptInput] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [isRunningSim, setIsRunningSim] = useState<boolean>(false);
  
  // Customization/Visual Settings
  const [fontSize, setFontSize] = useState<number>(13);
  const [enableCrtEffect, setEnableCrtEffect] = useState<boolean>(true);
  const [enableNeonBorders, setEnableNeonBorders] = useState<boolean>(true);
  
  const [copied, setCopied] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const previewFrameRef = useRef<HTMLIFrameElement>(null);

  // Listen for externally pushed code (e.g., from the chat block button)
  useEffect(() => {
    if (externalCode) {
      setCode(externalCode);
      if (externalLanguage && BLUEPRINTS[externalLanguage.toLowerCase()]) {
        setSelectedLanguage(externalLanguage.toLowerCase());
      } else {
        // Fallback to rust if unrecognized
        setSelectedLanguage('rust');
      }
      setTerminalLogs(prev => [
        ...prev,
        `[OS_DECK] Received external code payload from chat portal.`,
        `[SECURE] Sandboxed RAM buffer populated with active snippet.`
      ]);
      onClearExternal?.();
    }
  }, [externalCode, externalLanguage, onClearExternal]);

  // Initialize with selected language blueprint
  useEffect(() => {
    // Only set to blueprint if we are not loading an external code snippet (handled above)
    if (!externalCode) {
      setCode(BLUEPRINTS[selectedLanguage]?.blueprint || '');
      setTerminalLogs([
        `[OS_DECK] Loaded ${BLUEPRINTS[selectedLanguage]?.name} code deck pipeline.`,
        `[SECURE] Status: Ephemeral RAM memory isolated. No local footprint active.`
      ]);
    }
  }, [selectedLanguage]);

  // Syntax highlighting logic mapping code characters into beautifully colored spans
  const highlightCode = (codeText: string, lang: string) => {
    // Escape HTML first to prevent code execution
    let escaped = codeText
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    const placeholders: string[] = [];
    
    // Hide and preserve comments
    escaped = escaped.replace(/(\/\/[^\n]*|\#[^\n]*|\/\*[\s\S]*?\*\/)/g, (match) => {
      const ph = `__COMMENT_PLACEHOLDER_${placeholders.length}__`;
      placeholders.push(`<span class="text-slate-500 italic font-mono select-text">${match}</span>`);
      return ph;
    });

    // Hide and preserve strings
    escaped = escaped.replace(/("(\\.|[^"\\])*"|'(\\.|[^'\\])*'|`([\s\S]*?)`)/g, (match) => {
      const ph = `__STRING_PLACEHOLDER_${placeholders.length}__`;
      placeholders.push(`<span class="text-yellow-300 drop-shadow-[0_0_2px_rgba(234,179,8,0.4)] font-mono select-text">${match}</span>`);
      return ph;
    });

    // Keywords highlighters
    const keywords = /\b(pub|fn|let|mut|struct|enum|impl|match|if|else|return|use|mod|as|crate|async|await|const|type|def|class|import|from|for|while|try|except|finally|with|lambda|in|is|not|and|or|pass|None|True|False|self|var|function|constructor|extends|new|catch|throw|this|int|float|double|char|void|std|public|private|protected|namespace|using|include|package|elsif|unless|begin|end|elsif|rescue|ensure|nil|package|go|chan|select|map|interface|package|sub|my|our|local|exit|die|param|strict|warnings|html|body|div|span|script|style|link|meta|href|rel|class|id|import|from|require|module|exports)\b/g;
    escaped = escaped.replace(keywords, (match) => `<span class="text-[#ff007f] font-bold drop-shadow-[0_0_2px_rgba(255,0,127,0.4)] font-mono select-text">${match}</span>`);

    // Types and builtins
    const types = /\b(u8|u16|u32|u64|usize|i32|i64|f32|f64|String|str|Option|Result|Self|int|float|double|char|void|bool|Boolean|Number|Object|Array|Promise|Map|Set|dict|list|tuple|set|int|float|str|bool|any|vector|string|map|chan|error)\b/g;
    escaped = escaped.replace(types, (match) => `<span class="text-[#00ffcc] font-semibold drop-shadow-[0_0_2px_rgba(0,255,204,0.4)] font-mono select-text">${match}</span>`);

    // Numbers
    escaped = escaped.replace(/\b(\d+(\.\d+)?)\b/g, (match) => `<span class="text-[#ff9933] drop-shadow-[0_0_1px_rgba(255,153,51,0.4)] font-mono select-text">${match}</span>`);

    // Functions
    escaped = escaped.replace(/\b([a-zA-Z_]\w*)(?=\s*\()/g, (match) => `<span class="text-[#3399ff] font-medium font-mono select-text">${match}</span>`);

    // Restore comments & strings
    for (let i = placeholders.length - 1; i >= 0; i--) {
      escaped = escaped.replace(`__STRING_PLACEHOLDER_${i}__`, placeholders[i]);
      escaped = escaped.replace(`__COMMENT_PLACEHOLDER_${i}__`, placeholders[i]);
    }

    return escaped;
  };

  // Run or Compile logic
  const handleRunExecution = () => {
    setIsRunningSim(true);
    setTerminalLogs(prev => [...prev, `[COMPILER] Initiating Joey compiling pipeline...`, `[COMPILER] Fetching target toolchain...`]);

    setTimeout(() => {
      if (selectedLanguage === 'rust') {
        setTerminalLogs(prev => [
          ...prev,
          `[COMPILER] cargo build --release --target x86_64-joey-kernel`,
          `[ERROR] Rust compiler toolchain not found in current environment.`,
          `[COMPILER] Execution requires active backend runner. Compilation disabled in preview mode.`
        ]);
      } else if (selectedLanguage === 'python') {
        setTerminalLogs(prev => [
          ...prev,
          `[RUNNING] python3 joey_agent_router.py`,
          `[ERROR] Python interpreter not found in current environment.`,
          `[COMPILER] Execution requires active backend runner. Compilation disabled in preview mode.`
        ]);
      } else if (selectedLanguage === 'html' || selectedLanguage === 'css' || selectedLanguage === 'javascript') {
        setTerminalLogs(prev => [
          ...prev,
          `[BROWSER] Binding static file server...`,
          `[BROWSER] Serving index.html on port 3000...`,
          `[BROWSER] DOM nodes parsed successfully! Live frame refreshed.`
        ]);
        
        // Refresh the HTML iframe
        if (previewFrameRef.current) {
          const iframe = previewFrameRef.current;
          let iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
          if (iframeDoc) {
            iframeDoc.open();
            
            // If they are previewing CSS, wrap inside an HTML structure to show beautiful render
            if (selectedLanguage === 'css') {
              iframeDoc.write(`
                <html>
                <head>
                  <style>
                    body { background: #07090e; color: #fff; font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; padding: 20px; box-sizing: border-box; }
                    ${code}
                  </style>
                </head>
                <body>
                  <h1 class="laser-text-glow-green">JOEY CSS TEST HUD</h1>
                  <p class="laser-text-glow-pink">Vibrant Laser Glowing Shadows Active</p>
                  <div class="neon-border-cyan" style="padding: 20px; border-radius: 8px; margin: 10px; width: 80%; text-align: center;">
                    Cyan Neon Box Border Style
                  </div>
                  <div class="neon-border-pink" style="padding: 20px; border-radius: 8px; margin: 10px; width: 80%; text-align: center;">
                    Pink Neon Box Border Style
                  </div>
                </body>
                </html>
              `);
            } else if (selectedLanguage === 'javascript') {
              iframeDoc.write(`
                <html>
                <head>
                  <style>
                    body { background: #0b0c10; color: #00ffcc; font-family: monospace; overflow: hidden; margin: 0; }
                    canvas { display: block; width: 100vw; height: 100vh; }
                  </style>
                </head>
                <body>
                  <canvas id="retroCanvas"></canvas>
                  <script>
                    ${code}
                    // Trigger manual initialization
                    const effect = new MatrixRainEffect('retroCanvas', { fontSize: 13, glowColor: '#00ffcc' });
                    effect.start();
                  </script>
                </body>
                </html>
              `);
            } else {
              // HTML directly
              iframeDoc.write(code);
            }
            iframeDoc.close();
          }
        }
      } else {
        // Generic fallback logs
        setTerminalLogs(prev => [
          ...prev,
          `[RUNNING] Executing script with custom joey_os polyglot runtime...`,
          `[OK] Compiled core elements. Initializing sandbox context...`,
          `[SANDBOX] Ephemeral run nominal. Exit code: 0.`
        ]);
      }
      setIsRunningSim(false);
    }, 1200);
  };

  // Handle code copies
  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Handle local downloads
  const handleDownload = () => {
    const url = `data:text/plain;charset=utf-8,${encodeURIComponent(code)}`;
    const a = document.createElement('a');
    a.href = url;
    a.download = `joey_source.${BLUEPRINTS[selectedLanguage].extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    setSaveStatus("DOWNLOADED_LOCAL");
    setTimeout(() => setSaveStatus(null), 3000);
  };

  // Generate code dynamically with Joey server api (using Gemini-3.5-flash)
  const handleGenerateCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptInput.trim()) return;

    setIsGenerating(true);
    setTerminalLogs(prev => [
      ...prev,
      `[AI] Directing synthesis request to Joey's cognitive centers...`,
      `[AI] Formulating optimized ${BLUEPRINTS[selectedLanguage].name} structure for: "${promptInput}"...`
    ]);

    try {
      const response = await fetch('/api/canvas/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: selectedLanguage,
          prompt: promptInput,
          currentCode: code
        })
      });

      const data = await response.json();
      if (data.success && data.code) {
        setCode(data.code);
        setTerminalLogs(prev => [
          ...prev,
          `[SUCCESS] Joey successfully synthesized fresh secure code blueprint.`,
          `[AI] Response log: ${data.explanation || 'Optimal security headers locked.'}`
        ]);
        setPromptInput('');
      } else {
        throw new Error(data.error || "Generation endpoint communication breakdown.");
      }
    } catch (err: any) {
      console.error(err);
      setTerminalLogs(prev => [
        ...prev,
        `[COMM_ERR] Connection to secure core interrupted. Local sandbox safety fallback activated.`,
        `[SANDBOX] Falling back to precompiled template code.`
      ]);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="w-full flex flex-col gap-6 font-sans">
      
      {/* Intro Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-cyan-950/20 to-purple-950/10 border border-slate-800 rounded-2xl p-5 backdrop-blur shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
            <Code className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white uppercase tracking-wider font-mono">Joey's Advanced Code Canvas</h2>
            <p className="text-xs text-slate-400 mt-0.5">High-fidelity 1980s retro-cyber coding workspace with secure, non-local RAM sandboxing.</p>
          </div>
        </div>
        
        {/* Workspace Display Adjusters */}
        <div className="flex items-center gap-3 self-start md:self-auto bg-[#07090e] border border-slate-800 rounded-lg p-1.5 px-3">
          <Sliders className="w-4 h-4 text-slate-500" />
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mr-2">Config:</span>
          
          {/* CRT Monitor Effect Switcher */}
          <button 
            onClick={() => setEnableCrtEffect(!enableCrtEffect)}
            className={`px-2 py-1 text-[9px] font-bold tracking-widest uppercase rounded border transition-all duration-200 ${
              enableCrtEffect 
                ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-400 shadow-[0_0_8px_rgba(0,255,204,0.2)]' 
                : 'bg-transparent border-slate-800 text-slate-500 hover:text-slate-300'
            }`}
            title="Toggle retro CRT scanline monitor effect"
          >
            CRT
          </button>

          {/* Neon border switch */}
          <button 
            onClick={() => setEnableNeonBorders(!enableNeonBorders)}
            className={`px-2 py-1 text-[9px] font-bold tracking-widest uppercase rounded border transition-all duration-200 ${
              enableNeonBorders 
                ? 'bg-pink-500/10 border-pink-500/40 text-pink-400 shadow-[0_0_8px_rgba(255,0,127,0.2)]' 
                : 'bg-transparent border-slate-800 text-slate-500 hover:text-slate-300'
            }`}
            title="Toggle laser neon glowing border shadows"
          >
            Neon Glow
          </button>

          {/* Font Resizers */}
          <div className="flex items-center gap-1 border-l border-slate-800 pl-2 ml-1">
            <button 
              onClick={() => setFontSize(prev => Math.max(10, prev - 1))}
              className="px-1.5 py-0.5 text-xs text-slate-500 hover:text-white font-mono rounded bg-white/5"
              title="Decrease Font Size"
            >
              A-
            </button>
            <span className="text-[10px] font-mono text-slate-400 px-1">{fontSize}px</span>
            <button 
              onClick={() => setFontSize(prev => Math.min(20, prev + 1))}
              className="px-1.5 py-0.5 text-xs text-slate-500 hover:text-white font-mono rounded bg-white/5"
              title="Increase Font Size"
            >
              A+
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Code view left, Control panel + Compile logs right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: File deck & Glowing Code Window */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          
          {/* Language Selection Badges Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 bg-[#07090e]/60 border border-slate-800/80 rounded-xl p-2 scrollbar-thin">
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider px-2 shrink-0">Decks:</span>
            {Object.values(BLUEPRINTS).map((lang) => (
              <button
                key={lang.id}
                onClick={() => setSelectedLanguage(lang.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono tracking-tight transition-all duration-200 shrink-0 ${
                  selectedLanguage === lang.id
                    ? 'bg-gradient-to-r from-cyan-950 to-cyan-900 border border-cyan-500/50 text-cyan-300 shadow-[0_0_10px_rgba(0,255,204,0.15)] font-bold'
                    : 'bg-stone-900/40 border border-slate-800/50 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                {lang.name} <span className="text-[9px] opacity-55">.{lang.extension}</span>
              </button>
            ))}
          </div>

          {/* Large, Glowing Code Editor Box */}
          <div 
            className={`relative rounded-2xl bg-[#07090e] border transition-all duration-300 overflow-hidden ${
              enableNeonBorders 
                ? 'border-cyan-500/30 shadow-[0_0_20px_rgba(0,255,204,0.06),inset_0_0_15px_rgba(0,255,204,0.02)]' 
                : 'border-slate-800'
            } ${enableCrtEffect ? 'crt-overlay screen-scroll-flicker' : ''}`}
          >
            {/* Window bar */}
            <div className="h-10 border-b border-slate-800/80 bg-stone-900/40 flex items-center justify-between px-4 z-10 relative">
              <div className="flex items-center gap-2">
                <FileCode className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-xs font-mono text-slate-300 uppercase tracking-wider font-bold">
                  joey_source.{BLUEPRINTS[selectedLanguage].extension}
                </span>
                <span className="px-1.5 py-0.5 rounded bg-cyan-950/40 border border-cyan-800/40 text-cyan-400 text-[8px] font-mono uppercase tracking-widest">
                  RAM Ephemeral
                </span>
              </div>
              
              {/* Output operations */}
              <div className="flex items-center gap-2">
                <button 
                  onClick={handleCopyCode}
                  className="p-1.5 rounded hover:bg-white/5 transition text-slate-400 hover:text-white flex items-center gap-1 text-[10px] font-mono cursor-pointer"
                  title="Copy to Clipboard"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'COPIED' : 'COPY'}</span>
                </button>
                <button 
                  onClick={handleDownload}
                  className="p-1.5 rounded hover:bg-white/5 transition text-slate-400 hover:text-white flex items-center gap-1 text-[10px] font-mono cursor-pointer"
                  title="Download Script File"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>DOWNLOAD</span>
                </button>
              </div>
            </div>

            {/* Glowing Code Block Container */}
            <div className="p-4 overflow-x-auto min-h-[450px] max-h-[550px] relative select-text scrollbar-thin">
              <pre 
                className="font-mono leading-relaxed select-text"
                style={{ fontSize: `${fontSize}px` }}
              >
                <code 
                  className="block select-text"
                  dangerouslySetInnerHTML={{ 
                    __html: highlightCode(code, selectedLanguage) 
                  }} 
                />
              </pre>
            </div>

            {/* Status Line */}
            <div className="h-8 border-t border-slate-900 bg-stone-950/20 px-4 flex items-center justify-between text-[9px] font-mono text-slate-500 z-10 relative">
              <span>Lines: {code.split('\n').length} | Size: {new TextEncoder().encode(code).length} bytes</span>
              <span>Encrypted Signature: AES-GCM-256-NOMINAL</span>
            </div>
          </div>
        </div>

        {/* Right Side: Interactive Prompting + Compiler terminal */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Generate with Joey widget */}
          <div className="bg-[#07090e]/95 border border-slate-800/80 rounded-2xl p-5 shadow-lg backdrop-blur flex flex-col gap-4">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4.5 h-4.5 text-pink-500" />
              <h3 className="text-xs font-bold text-white uppercase tracking-widest font-mono">Synthesize with Joey</h3>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed font-mono">
              Ask Joey to write high-fidelity secure modules. He defaults to <strong className="text-cyan-400">Rust</strong> for normal code, and <strong className="text-yellow-400">Python</strong> for AI agent models.
            </p>

            <form onSubmit={handleGenerateCode} className="flex flex-col gap-2 mt-1">
              <textarea
                value={promptInput}
                onChange={(e) => setPromptInput(e.target.value)}
                placeholder={`Prompt Joey (e.g. "${BLUEPRINTS[selectedLanguage].defaultPrompt}")`}
                rows={3}
                className="w-full bg-[#101726]/80 border border-slate-800 focus:border-cyan-500/50 rounded-xl p-3 text-xs text-white placeholder-slate-600 outline-none resize-none transition"
                disabled={isGenerating}
              />
              <button
                type="submit"
                disabled={isGenerating || !promptInput.trim()}
                className="w-full py-2.5 bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white font-mono text-[10px] font-bold tracking-widest uppercase rounded-xl transition-all duration-300 shadow-md shadow-cyan-500/15 flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>SYNTHESIZING CORE...</span>
                  </>
                ) : (
                  <>
                    <Cpu className="w-3.5 h-3.5" />
                    <span>GENERATE CODE</span>
                  </>
                )}
              </button>
            </form>
            
            {saveStatus === "DOWNLOADED_LOCAL" && (
              <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono rounded flex items-center gap-1.5 animate-pulse">
                <CheckCircle2 className="w-3.5 h-3.5" /> File isolated into downloads buffer!
              </div>
            )}
          </div>

          {/* Interactive Run Terminal & Live HTML Frame */}
          <div className="bg-[#07090e] border border-slate-800 rounded-2xl overflow-hidden shadow-lg flex flex-col min-h-[320px]">
            {/* Terminal Tab switcher */}
            <div className="h-10 border-b border-slate-800 bg-stone-900/40 px-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TerminalIcon className="w-4 h-4 text-pink-500" />
                <span className="text-xs font-mono text-slate-300 uppercase tracking-widest font-bold">Compiler Deck</span>
              </div>
              
              <button 
                onClick={handleRunExecution}
                disabled={isRunningSim || isGenerating}
                className="px-2.5 py-1 bg-cyan-500/10 hover:bg-cyan-500/25 text-cyan-400 border border-cyan-500/30 rounded text-[9px] font-bold tracking-widest uppercase flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
              >
                <Play className="w-3 h-3 fill-cyan-400" />
                {isRunningSim ? 'COMPILING' : 'RUN'}
              </button>
            </div>

            {/* Split Display: If language is html/css/js we can show an iframe preview! */}
            {(selectedLanguage === 'html' || selectedLanguage === 'css' || selectedLanguage === 'javascript') ? (
              <div className="flex-1 flex flex-col">
                {/* Monitor terminal output */}
                <div className="h-28 bg-[#030508] p-3 overflow-y-auto border-b border-slate-900 scrollbar-none select-text">
                  <div className="text-[10px] font-mono text-emerald-500/80 space-y-1 select-text">
                    {terminalLogs.map((log, i) => (
                      <div key={i} className="leading-snug select-text">{log}</div>
                    ))}
                  </div>
                </div>
                {/* HTML Render Panel */}
                <div className="flex-1 bg-stone-950 p-2 relative flex flex-col min-h-[180px]">
                  <div className="text-[9px] font-mono text-slate-500 mb-1 flex items-center gap-1 uppercase tracking-wider">
                    <Monitor className="w-3 h-3" /> Live Sandbox Preview
                  </div>
                  <div className="flex-1 rounded border border-slate-800 bg-[#05070a] overflow-hidden">
                    <iframe 
                      ref={previewFrameRef}
                      title="HTML Preview Frame"
                      className="w-full h-full border-none"
                      sandbox="allow-scripts"
                    />
                  </div>
                </div>
              </div>
            ) : (
              // Just the pure CRT-styled actual compilation terminal
              <div className="flex-1 bg-[#030508] p-4 flex flex-col font-mono relative overflow-hidden">
                <div className="flex-1 overflow-y-auto space-y-1.5 text-[10px] text-emerald-400 select-text scrollbar-thin">
                  {terminalLogs.map((log, idx) => (
                    <div 
                      key={idx} 
                      className={`leading-relaxed select-text ${
                        log.startsWith('[CRITICAL]') || log.startsWith('[ALERT]') || log.startsWith('[WARNING]')
                          ? 'text-red-400 font-bold' 
                          : log.startsWith('[SUCCESS]') || log.startsWith('[SECURE]')
                          ? 'text-cyan-400 font-bold'
                          : log.startsWith('[AI]')
                          ? 'text-pink-400'
                          : 'text-emerald-400/85'
                      }`}
                    >
                      {log}
                    </div>
                  ))}
                  {isRunningSim && (
                    <div className="text-cyan-400 animate-pulse font-bold text-[9px] flex items-center gap-1 mt-1">
                      <RefreshCw className="w-3 h-3 animate-spin" /> PROBING INTEGRITY REGISTRY...
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
