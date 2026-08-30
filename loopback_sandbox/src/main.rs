use std::env;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
struct LoopbackResult {
    status: String,
    insight: Option<String>,
}

fn main() {
    let args: Vec<String> = env::args().collect();
    if args.len() < 2 {
        eprintln!("Usage: loopback_sandbox <json_string>");
        std::process::exit(1);
    }
    
    let raw_input = &args[1];
    
    // Clean markdown if present
    let cleaned = raw_input.trim()
        .strip_prefix("```json").unwrap_or(raw_input)
        .strip_prefix("```").unwrap_or(raw_input)
        .strip_suffix("```").unwrap_or(raw_input).trim();
        
    match serde_json::from_str::<LoopbackResult>(cleaned) {
        Ok(parsed) => {
            if parsed.status == "FLAG" {
                println!("FLAG|");
            } else {
                let insight_text = parsed.insight.unwrap_or_default();
                println!("SAFE|{}", insight_text);
            }
        },
        Err(_) => {
            println!("ERROR|Failed to parse Sandbox JSON securely.");
        }
    }
}
