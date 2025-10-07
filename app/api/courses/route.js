import { db } from "@/configs/db";
import { STUDY_MATERIAL_TABLE } from "@/configs/schema";
import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";

// Simple in-memory cache to reduce database calls
const cache = new Map();
const CACHE_TTL = 3 * 60 * 1000; // 3 minutes

function getCachedData(key) {
    const cached = cache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.data;
    }
    cache.delete(key);
    return null;
}

function setCachedData(key, data) {
    cache.set(key, { data, timestamp: Date.now() });
    
    // Clean up old cache entries (keep cache size manageable)
    if (cache.size > 100) {
        const oldestKey = cache.keys().next().value;
        cache.delete(oldestKey);
    }
}

export async function POST(req){
    const {createdBy}=await req.json();
    
    // Check cache first
    const cacheKey = `courses_${createdBy}`;
    const cachedResult = getCachedData(cacheKey);
    
    if (cachedResult) {
        return NextResponse.json({result: cachedResult}, {
            headers: {
                'Cache-Control': 'public, s-maxage=180, stale-while-revalidate=300'
            }
        });
    }
    
    // Fetch from database
    const result = await db.select()
                     .from(STUDY_MATERIAL_TABLE)
                     .where(eq(STUDY_MATERIAL_TABLE.createdBy, createdBy))
                     .orderBy(desc(STUDY_MATERIAL_TABLE.id));
    
    // Cache the result
    setCachedData(cacheKey, result);
    
    return NextResponse.json({result:result}, {
        headers: {
            'Cache-Control': 'public, s-maxage=180, stale-while-revalidate=300'
        }
    });
}

export async function GET(req){
    const reqUrl = req.url;
    const {searchParams}=new URL(reqUrl);
    const courseId=searchParams?.get('courseId');
    
    // Check cache first
    const cacheKey = `course_${courseId}`;
    const cachedResult = getCachedData(cacheKey);
    
    if (cachedResult) {
        return NextResponse.json({result: cachedResult}, {
            headers: {
                'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
            }
        });
    }
    
    // Fetch from database
    const course = await db.select()
                           .from(STUDY_MATERIAL_TABLE)
                           .where(eq(STUDY_MATERIAL_TABLE?.courseId,courseId));

    // Cache the result
    if (course[0]) {
        setCachedData(cacheKey, course[0]);
    }

    return NextResponse.json({result:course[0]}, {
        headers: {
            'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
        }
    });
}